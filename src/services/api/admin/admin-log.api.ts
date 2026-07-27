import { apiClient } from "../client";

export interface AdminUserLogItem {
  id: string;
  usuario_id: string;
  entidade_tipo: string;
  entidade_id: string;
  acao: string;
  descricao: string;
  meta: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  usuarios?: {
    id?: string;
    nome: string;
    telefone: string;
    email?: string;
  };
}

export interface AdminUserLogsResponse {
  data: AdminUserLogItem[];
  total: number;
  page: number;
  limit: number;
}

const BASE = "/admin";

export const adminLogApi = {
  getUserLogs: (id: string, params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string }) =>
    apiClient.get<AdminUserLogsResponse>(`${BASE}/users/${id}/logs`, { params }).then(r => r.data),

  getLogs: (params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string; search_cpf?: string }) =>
    apiClient.get<AdminUserLogsResponse>(`${BASE}/logs`, { params }).then(r => r.data),
};
