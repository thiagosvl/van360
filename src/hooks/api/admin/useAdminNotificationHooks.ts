import { useQuery } from "@tanstack/react-query";
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

export function useAdminGlobalNotifications(params?: AdminNotificationQueryParams) {
  return useQuery({
    queryKey: ["admin", "global", "notifications", params],
    queryFn: () => adminNotificationApi.getGlobalNotifications(params),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

