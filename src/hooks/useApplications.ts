import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await apiClient.getApplications();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.applications;
    },
    refetchInterval: 30000, // Refetch every 30 seconds to reduce API load
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

export function useSetApplicationVolume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ processPath, volume }: { processPath: string; volume: number }) => {
      const response = await apiClient.setApplicationVolume(processPath, volume);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useProcesses() {
  return useQuery({
    queryKey: ['processes'],
    queryFn: async () => {
      const response = await apiClient.getProcesses();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.processes;
    },
  });
}