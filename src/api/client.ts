import { 
  AudioDevice, 
  AudioApplication, 
  AudioProcess, 
  VolumeInfo, 
  DeviceListResponse,
  ApiResult 
} from '@/types/audio';
import { Settings } from '@/types/settings';

const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
    
    if (API_KEY) {
      this.headers['X-API-Key'] = API_KEY;
    }
  }

  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
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
}

export const apiClient = new ApiClient();