import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await apiClient.getDevices();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    refetchIntervalInBackground: false, // Stop refetching when tab is in background
    retry: (failureCount, error: any) => {
      // Don't retry on 429 errors
      if (error?.response?.status === 429) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useDeviceVolume(device: string) {
  return useQuery({
    queryKey: ['device-volume', device],
    queryFn: async () => {
      const response = await apiClient.getDeviceVolume(device);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    enabled: !!device,
  });
}

export function useSetDeviceVolume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ device, volume }: { device: string; volume: number }) => {
      const response = await apiClient.setDeviceVolume(device, volume);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['device-volume', variables.device] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useSetDeviceMute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ device, muted }: { device: string; muted: boolean }) => {
      const response = await apiClient.setDeviceMute(device, muted);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['device-volume', variables.device] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}