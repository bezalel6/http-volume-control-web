export interface AudioDevice {
  name: string;
  id: string;
  type: string;
  state: string;
  default: boolean;
  volume: number;
  muted: boolean;
}

export interface AudioApplication {
  processPath: string;
  processId: number;
  mainWindowTitle: string;
  displayName: string;
  iconPath: string | null;
  volume: number;
  muted: boolean;
  instanceId?: string;
}

export interface AudioProcess {
  processPath: string;
  processId: number;
  mainWindowTitle: string;
  displayName: string;
  iconPath: string | null;
}

export interface VolumeInfo {
  volume: number;
  muted: boolean;
}

export interface DeviceListResponse {
  devices: AudioDevice[];
  defaultDevice: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
}

export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true;
}

export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  code?: string;
}

export type ApiResult<T> = (SuccessResponse<T> & T) | ErrorResponse;