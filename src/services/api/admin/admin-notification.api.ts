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
  usuarios?: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cpfcnpj: string;
  } | null;
}

export interface AdminNotificationQueryParams {
  page?: number;
  limit?: number;
  canal?: string;
  status?: string;
  categoria?: string;
  evento?: string;
  search?: string;
  searchMotorista?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface NotificationKpisDTO {
  total: number;
  sent: number;
  failed: number;
  cancelled: number;
  wabaSent: number;
  wabaFailed: number;
  custoEstimadoWaba: number;
  taxaSucesso: number;
  canais: {
    waba: number;
    firebase: number;
    resend: number;
    telegram: number;
    evolution: number;
    sms: number;
  };
}

export interface AdminUserNotificationsResponse {
  data: AdminNotificationLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminGlobalNotificationsResponse extends AdminUserNotificationsResponse {
  kpis?: NotificationKpisDTO;
}

const BASE = "/admin";

export const adminNotificationApi = {
  getUserNotifications: (id: string, params?: AdminNotificationQueryParams) =>
    apiClient.get<AdminUserNotificationsResponse>(`${BASE}/users/${id}/notifications`, { params }).then(r => r.data),

  getPassengerNotifications: (id: string, params?: AdminNotificationQueryParams) =>
    apiClient.get<AdminUserNotificationsResponse>(`${BASE}/passengers/${id}/notifications`, { params }).then(r => r.data),

  getGlobalNotifications: (params?: AdminNotificationQueryParams) =>
    apiClient.get<AdminGlobalNotificationsResponse>(`${BASE}/notifications`, { params }).then(r => r.data),
};

