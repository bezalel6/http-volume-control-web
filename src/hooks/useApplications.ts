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
    refetchInterval: 5000, // Refetch every 5 seconds to catch new apps
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