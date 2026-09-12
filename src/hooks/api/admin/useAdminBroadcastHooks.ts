import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminBroadcastApi,
  AdminBroadcastSendPayload,
} from '@/services/api/admin/admin-broadcast.api';

export function useAdminBroadcastEstimate(
  params: { status?: string[]; motoristaIds?: string[] },
  enabled = true
) {
  const hasStatus = !!params.status && params.status.length > 0;
  const hasDrivers = !!params.motoristaIds && params.motoristaIds.length > 0;

  return useQuery({
    queryKey: ['admin', 'broadcast', 'estimate', params.status, params.motoristaIds],
    queryFn: () => adminBroadcastApi.getEstimate(params),
    enabled: enabled && (hasStatus || hasDrivers),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useAdminSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminBroadcastSendPayload) =>
      adminBroadcastApi.sendBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'global', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcast'] });
    },
  });
}
