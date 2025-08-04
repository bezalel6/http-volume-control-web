import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ERROR_CODES } from '@/types/pairing';

interface PairingState {
  sessionId: string | null;
  expiresIn: number;
  timeRemaining: number;
  error: string | null;
  errorCode: string | null;
}

export function usePairing() {
  const queryClient = useQueryClient();
  const [pairingState, setPairingState] = useState<PairingState>({
    sessionId: null,
    expiresIn: 0,
    timeRemaining: 0,
    error: null,
    errorCode: null,
  });

  // Check if already authenticated
  const isAuthenticated = apiClient.isAuthenticated();
  const sessionInfo = apiClient.getSessionInfo();

  // Get pairing status
  const { data: pairingStatus } = useQuery({
    queryKey: ['pairing-status'],
    queryFn: () => apiClient.getPairingStatus(),
    enabled: !isAuthenticated,
    refetchInterval: false,
  });

  // Get sessions list
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiClient.getSessions(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Initiate pairing mutation
  const initiatePairing = useMutation({
    mutationFn: (deviceName?: string) => apiClient.initiatePairing(deviceName),
    onSuccess: (data) => {
      setPairingState({
        sessionId: data.sessionId,
        expiresIn: data.expiresIn,
        timeRemaining: data.expiresIn,
        error: null,
        errorCode: null,
      });
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      setPairingState((prev) => ({
        ...prev,
        error: errorData?.error || error.message || 'Failed to initiate pairing',
        errorCode: errorData?.code || null,
      }));
    },
  });

  // Complete pairing mutation
  const completePairing = useMutation({
    mutationFn: ({ code, sessionId }: { code: string; sessionId: string }) =>
      apiClient.completePairing(code, sessionId),
    onSuccess: (data) => {
      // Store auth token and session
      apiClient.setAuthToken(data.token, data.session);
      
      // Clear pairing state
      setPairingState({
        sessionId: null,
        expiresIn: 0,
        timeRemaining: 0,
        error: null,
        errorCode: null,
      });
      
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
      
      // Close pairing dialog on success
      window.dispatchEvent(new CustomEvent('pairing-success'));
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      const errorCode = errorData?.code;
      let errorMessage = errorData?.error || error.message || 'Failed to complete pairing';
      
      // Provide user-friendly error messages
      if (errorCode === ERROR_CODES.PAIRING_CODE_INVALID) {
        errorMessage = 'Invalid pairing code. Please check and try again.';
      } else if (errorCode === ERROR_CODES.PAIRING_CODE_EXPIRED) {
        errorMessage = 'The pairing code has expired. Please start over.';
      } else if (errorCode === ERROR_CODES.SESSION_LIMIT_REACHED) {
        errorMessage = 'Maximum number of paired devices reached. Please remove an existing device first.';
      }
      
      setPairingState((prev) => ({
        ...prev,
        error: errorMessage,
        errorCode: errorCode || null,
      }));
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  // Revoke session mutation
  const revokeSession = useMutation({
    mutationFn: (sessionId: string) => apiClient.revokeSession(sessionId),
    onSuccess: () => {
      refetchSessions();
    },
  });

  // Cancel pairing
  const cancelPairing = () => {
    setPairingState({
      sessionId: null,
      expiresIn: 0,
      timeRemaining: 0,
      error: null,
      errorCode: null,
    });
  };

  // Countdown timer for pairing expiry
  useEffect(() => {
    if (!pairingState.sessionId || pairingState.timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setPairingState((prev) => {
        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          return {
            sessionId: null,
            expiresIn: 0,
            timeRemaining: 0,
            error: 'Pairing code expired. Please try again.',
            errorCode: ERROR_CODES.PAIRING_CODE_EXPIRED,
          };
        }
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pairingState.sessionId, pairingState.timeRemaining]);

  return {
    // State
    isAuthenticated,
    sessionInfo,
    pairingStatus,
    pairingState,
    sessions: sessions?.sessions || [],
    
    // Actions
    initiatePairing: initiatePairing.mutate,
    completePairing: completePairing.mutate,
    cancelPairing,
    logout: logout.mutate,
    revokeSession: revokeSession.mutate,
    
    // Loading states
    isInitiating: initiatePairing.isPending,
    isCompleting: completePairing.isPending,
    isLoggingOut: logout.isPending,
  };
}