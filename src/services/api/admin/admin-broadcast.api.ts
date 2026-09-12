import { apiClient } from '../client';
import { PushNotificationAction } from '@/types/enums';

export interface AdminBroadcastEstimateResponse {
  totalMotoristas: number;
  comPushToken: number;
  semPushToken: number;
  detalhesPorStatus: Record<string, number>;
}

export interface AdminBroadcastSendPayload {
  status?: string[];
  motoristaIds?: string[];
  titulo: string;
  mensagem: string;
  action: PushNotificationAction;
}

export interface AdminBroadcastEstimateParams {
  status?: string[];
  motoristaIds?: string[];
}

export interface AdminBroadcastSendResponse {
  totalDestinatarios: number;
  totalEnviados: number;
  totalFalhas: number;
}

const BASE = '/admin/notifications/broadcast';

export const adminBroadcastApi = {
  getEstimate: (params: AdminBroadcastEstimateParams) => {
    const queryParams: Record<string, string> = {};
    if (params.status && params.status.length > 0) {
      queryParams.status = params.status.join(',');
    }
    if (params.motoristaIds && params.motoristaIds.length > 0) {
      queryParams.motoristaIds = params.motoristaIds.join(',');
    }

    return apiClient
      .get<AdminBroadcastEstimateResponse>(`${BASE}/estimate`, {
        params: queryParams,
      })
      .then((r) => r.data);
  },

  sendBroadcast: (payload: AdminBroadcastSendPayload) =>
    apiClient
      .post<AdminBroadcastSendResponse>(`${BASE}/send`, payload)
      .then((r) => r.data),
};
