import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketService } from "@/services";
import type { Alert } from "@/data/types";
import { useAuth } from "@/contexts/useAuth";

function upsertAlert(alerts: Alert[], alert: Alert): Alert[] {
  const index = alerts.findIndex((item) => item.id === alert.id);
  if (index === -1) return [alert, ...alerts];

  return alerts.map((item) => (item.id === alert.id ? alert : item));
}

export function getAlertsQueryKey(userId?: string | null) {
  return ["alerts", userId ?? "anonymous"] as const;
}

export function useAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: getAlertsQueryKey(user?.id),
    queryFn: () => marketService.getAlerts(),
    staleTime: 0,
  });
}

export function useSaveAlert() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = getAlertsQueryKey(user?.id);

  return useMutation({
    mutationFn: (alert: Alert) => marketService.saveAlert(alert),
    onMutate: async (alert) => {
      await queryClient.cancelQueries({ queryKey });

      const previousAlerts = queryClient.getQueryData<Alert[]>(queryKey) ?? [];
      queryClient.setQueryData<Alert[]>(
        queryKey,
        upsertAlert(previousAlerts, alert),
      );

      return { previousAlerts };
    },
    onError: (_error, _alert, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(queryKey, context.previousAlerts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey, refetchType: "none" });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = getAlertsQueryKey(user?.id);

  return useMutation({
    mutationFn: (id: string) => marketService.deleteAlert(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });

      const previousAlerts = queryClient.getQueryData<Alert[]>(queryKey) ?? [];
      queryClient.setQueryData<Alert[]>(
        queryKey,
        previousAlerts.filter((alert) => alert.id !== id),
      );

      return { previousAlerts };
    },
    onError: (_error, _id, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(queryKey, context.previousAlerts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey, refetchType: "none" });
    },
  });
}
