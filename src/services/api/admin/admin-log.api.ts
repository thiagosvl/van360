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
    apelido?: string | null;
  };
}

export interface AdminUserLogsResponse {
  data: AdminUserLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserGroupLogItem {
  usuario_id: string;
  usuario_nome: string | null;
  usuario_apelido: string | null;
  usuario_telefone: string | null;
  usuario_email: string | null;
  total_atividades: number;
  primeira_atividade_em: string | null;
  ultima_atividade_em: string | null;
  ultimas_atividades: AdminUserLogItem[];
}

export interface AdminLogsByUserResponse {
  data: AdminUserGroupLogItem[];
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

  getLogsByUser: (params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string; search_cpf?: string }) =>
    apiClient.get<AdminLogsByUserResponse>(`${BASE}/logs/by-user`, { params }).then(r => r.data),
};
