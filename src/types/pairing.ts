export interface PairingStatus {
  pairingEnabled: boolean;
  codeLength: number;
  codeExpiry: number;
}

export interface PairingInitiateResponse {
  success: boolean;
  sessionId: string;
  expiresIn: number;
  timestamp: string;
}

export interface PairingCompleteResponse {
  success: boolean;
  token: string;
  session: {
    id: string;
    deviceName: string;
    createdAt: string;
    expiresAt: string;
  };
  timestamp: string;
}

export interface Session {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
}

export interface SessionListResponse {
  success: boolean;
  sessions: Session[];
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}

export const ERROR_CODES = {
  PAIRING_CODE_INVALID: 'PAIRING_CODE_INVALID',
  PAIRING_CODE_EXPIRED: 'PAIRING_CODE_EXPIRED',
  PAIRING_RATE_LIMITED: 'PAIRING_RATE_LIMITED',
  SESSION_INVALID: 'SESSION_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_LIMIT_REACHED: 'SESSION_LIMIT_REACHED',
  UNAUTHORIZED: 'UNAUTHORIZED'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];