import { 
  AudioDevice, 
  AudioApplication, 
  AudioProcess, 
  VolumeInfo, 
  DeviceListResponse,
  ApiResult 
} from '@/types/audio';
import { Settings } from '@/types/settings';
import { 
  PairingStatus, 
  PairingInitiateResponse, 
  PairingCompleteResponse, 
  SessionListResponse 
} from '@/types/pairing';

// Dynamically determine API URL based on where the app is served from
const getApiUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on localhost (development), use localhost API
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Otherwise, assume API is on same host but different port
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
};

const API_URL = getApiUrl();
const API_KEY = import.meta.env.VITE_API_KEY || '';
const TOKEN_KEY = 'http-volume-control-token';
const SESSION_KEY = 'http-volume-control-session';

class ApiClient {
  public readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
    console.log('API Client initialized with URL:', this.baseUrl);
  }

  public getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Check for stored token first, then API key
    const storedToken = this.getStoredToken();
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    } else if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }
    
    return headers;
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredSession(): string | null {
    return localStorage.getItem(SESSION_KEY);
  }

  public setAuthToken(token: string, sessionData: any): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }

  public clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.getStoredToken() || !!API_KEY;
  }

  public getSessionInfo(): any | null {
    const session = this.getStoredSession();
    return session ? JSON.parse(session) : null;
  }

  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const fullUrl = `${this.baseUrl}${url}`;
      const finalHeaders = {
        ...this.getHeaders(),
        ...options?.headers,
      };
      
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: finalHeaders,
        credentials: 'include', // Include credentials for CORS
      });

      // Handle 429 Too Many Requests before parsing JSON
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000; // Default to 60 seconds
        const error = new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`);
        (error as any).response = { data: { error: 'Rate limit exceeded' }, status: 429, retryAfter: waitTime };
        throw error;
      }

      const data = await response.json();

      // Health endpoint doesn't have a success field, check if response is ok
      if (url === '/health') {
        if (!response.ok) {
          const error = new Error(data.error || 'Health check failed');
          (error as any).response = { data, status: response.status };
          throw error;
        }
        return data;
      }

      if (!data.success) {
        // Handle unauthorized errors by clearing auth
        if (response.status === 401 || data.code === 'UNAUTHORIZED' || data.code === 'SESSION_INVALID' || data.code === 'SESSION_EXPIRED') {
          this.clearAuth();
          // Dispatch custom event to notify app
          window.dispatchEvent(new CustomEvent('auth-error', { detail: data }));
        }
        const error = new Error(data.error || 'API request failed');
        (error as any).response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError = new Error('Network error: Unable to connect to server');
        (networkError as any).response = { data: { error: 'Network error' }, status: 0 };
        throw networkError;
      }
      throw error;
    }
  }

  // Device endpoints
  async getDevices(): Promise<ApiResult<DeviceListResponse>> {
    return this.fetch<ApiResult<DeviceListResponse>>('/api/devices');
  }

  async getDeviceVolume(device: string): Promise<ApiResult<VolumeInfo & { device: string }>> {
    return this.fetch<ApiResult<VolumeInfo & { device: string }>>(`/api/devices/${encodeURIComponent(device)}/volume`);
  }

  async setDeviceVolume(device: string, volume: number): Promise<ApiResult<{ device: string; volume: number }>> {
    return this.fetch<ApiResult<{ device: string; volume: number }>>(`/api/devices/${encodeURIComponent(device)}/volume`, {
      method: 'PUT',
      body: JSON.stringify({ volume }),
    });
  }

  async setDeviceMute(device: string, muted: boolean): Promise<ApiResult<{ device: string; muted: boolean }>> {
    return this.fetch<ApiResult<{ device: string; muted: boolean }>>(`/api/devices/${encodeURIComponent(device)}/mute`, {
      method: 'PUT',
      body: JSON.stringify({ muted }),
    });
  }

  // Application endpoints
  async getApplications(): Promise<ApiResult<{ applications: AudioApplication[] }>> {
    return this.fetch<ApiResult<{ applications: AudioApplication[] }>>('/api/applications');
  }

  async setApplicationVolume(processPath: string, volume: number): Promise<ApiResult<{ processPath: string; volume: number }>> {
    return this.fetch<ApiResult<{ processPath: string; volume: number }>>('/api/applications/volume', {
      method: 'PUT',
      body: JSON.stringify({ processPath, volume }),
    });
  }

  // Process endpoints
  async getProcesses(): Promise<ApiResult<{ processes: AudioProcess[] }>> {
    return this.fetch<ApiResult<{ processes: AudioProcess[] }>>('/api/processes');
  }

  // Settings endpoints
  async getSettings(): Promise<ApiResult<{ settings: Settings }>> {
    return this.fetch<ApiResult<{ settings: Settings }>>('/api/settings');
  }

  async updateSettings(settings: Partial<Settings>): Promise<ApiResult<{ settings: Settings }>> {
    return this.fetch<ApiResult<{ settings: Settings }>>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return this.fetch<{ status: string; timestamp: string; uptime: number }>('/health');
  }

  // Pairing endpoints
  async getPairingStatus(): Promise<PairingStatus & { success: boolean; timestamp: string }> {
    return this.fetch<PairingStatus & { success: boolean; timestamp: string }>('/api/pairing/status');
  }

  async initiatePairing(deviceName?: string): Promise<PairingInitiateResponse> {
    return this.fetch<PairingInitiateResponse>('/api/pairing/initiate', {
      method: 'POST',
      body: JSON.stringify({ deviceName }),
    });
  }

  async completePairing(code: string, sessionId: string): Promise<PairingCompleteResponse> {
    return this.fetch<PairingCompleteResponse>('/api/pairing/complete', {
      method: 'POST',
      body: JSON.stringify({ code, sessionId }),
    });
  }

  async getSessions(): Promise<SessionListResponse> {
    return this.fetch<SessionListResponse>('/api/sessions');
  }

  async getCurrentSession(): Promise<ApiResult<{ session: any }>> {
    return this.fetch<ApiResult<{ session: any }>>('/api/sessions/current');
  }

  async revokeSession(sessionId: string): Promise<ApiResult<{ message: string }>> {
    return this.fetch<ApiResult<{ message: string }>>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async logout(): Promise<ApiResult<{ message: string }>> {
    const result = await this.fetch<ApiResult<{ message: string }>>('/api/sessions/logout', {
      method: 'POST',
    });
    this.clearAuth();
    return result;
  }
}

export const apiClient = new ApiClient();