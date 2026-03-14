import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketService } from '@/services';
import type { Alert } from '@/data/types';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => marketService.getAlerts(),
    staleTime: 0,
  });
}

export function useSaveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: Alert) => marketService.saveAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
