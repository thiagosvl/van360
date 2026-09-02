import { apiClient } from "../client";

export interface AdminNotificationLogItem {
  id: string;
  usuario_id: string | null;
  canal: string;
  evento: string;
  destinatario: string;
  status: string;
  tentativas: number;
  max_tentativas: number;
  proxima_tentativa_em: string;
  payload: Record<string, unknown>;
  erro_mensagem: string | null;
  provider_message_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AdminUserNotificationsResponse {
  data: AdminNotificationLogItem[];
  total: number;
  page: number;
  limit: number;
}

const BASE = "/admin";

export const adminNotificationApi = {
  getUserNotifications: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<AdminUserNotificationsResponse>(`${BASE}/users/${id}/notifications`, { params }).then(r => r.data),

  getPassengerNotifications: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<AdminUserNotificationsResponse>(`${BASE}/passengers/${id}/notifications`, { params }).then(r => r.data),
};
