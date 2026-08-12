import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

interface PushTokenPayload {
  token: string;
  platform: string;
}

export const usePushToken = () => {
  return useMutation({
    mutationFn: async (payload: PushTokenPayload) => {
      const response = await apiClient.post('/notifications/push-token', payload);
      return response.data;
    }
  });
};
