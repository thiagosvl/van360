import { useQuery } from "@tanstack/react-query";
import { adminNotificationApi } from "@/services/api/admin/admin-notification.api";

export function useAdminUserNotifications(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "users", id, "notifications", params],
    queryFn: () => adminNotificationApi.getUserNotifications(id, params),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useAdminPassengerNotifications(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "passengers", id, "notifications", params],
    queryFn: () => adminNotificationApi.getPassengerNotifications(id, params),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}
