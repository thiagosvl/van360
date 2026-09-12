import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminNotificationApi, AdminNotificationQueryParams } from "@/services/api/admin/admin-notification.api";

export function useAdminUserNotifications(id: string, params?: AdminNotificationQueryParams) {
  return useQuery({
    queryKey: ["admin", "users", id, "notifications", params],
    queryFn: () => adminNotificationApi.getUserNotifications(id, params),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useAdminPassengerNotifications(id: string, params?: AdminNotificationQueryParams) {
  return useQuery({
    queryKey: ["admin", "passengers", id, "notifications", params],
    queryFn: () => adminNotificationApi.getPassengerNotifications(id, params),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useAdminGlobalNotifications(params?: AdminNotificationQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["admin", "global", "notifications", params],
    queryFn: () => adminNotificationApi.getGlobalNotifications(params),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useAdminRetryNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, executeImmediately }: { id: string; executeImmediately?: boolean }) =>
      adminNotificationApi.retryNotification(id, executeImmediately),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminRetryBulkNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids?: string[]; filters?: AdminNotificationQueryParams }) =>
      adminNotificationApi.retryBulkNotifications(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

