import { apiClient } from "./client";
import { WhatsappStatus } from "@/types/enums";

export interface AdminDashboardStats {
  totalMotoristas: number;
  totalPassageiros: number;
  receitaTotal: number;
  assinaturas: {
    trial: number;
    active: number;
    past_due: number;
    expired: number;
    canceled: number;
  };
  whatsappStatus?: WhatsappStatus;
  recentUsers: Array<{
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    created_at: string;
    tipo: string;
    assinaturas?: Array<{
      status: string;
    }>;
  }>;
}

export interface AdminUserListItem {
  id: string;
  nome: string;
  razao_social: string | null;
  apelido: string | null;
  email: string;
  cpfcnpj: string;
  telefone: string;
  ativo: boolean;
  tipo: string;
  created_at: string;
  data_nascimento: string | null;
  assinaturas: Array<{
    id: string;
    status: string;
    plano_id: string;
    data_vencimento: string | null;
    trial_ends_at: string | null;
    planos: {
      id: string;
      nome: string;
      identificador: string;
    } | null;
  }>;
}

export interface AdminUserListResponse {
  data: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserDetailsResponse {
  user: {
    id: string;
    nome: string;
    razao_social: string | null;
    apelido: string | null;
    email: string;
    cpfcnpj: string;
    telefone: string;
    ativo: boolean;
    tipo: string;
    created_at: string;
    updated_at: string;
    data_nascimento: string | null;
  };
  assinatura: {
    id: string;
    usuario_id: string;
    plano_id: string;
    status: string;
    data_inicio: string;
    data_vencimento: string | null;
    trial_ends_at: string | null;
    valor_base: number | null;
    valor_promocional: number | null;
    data_fim_promocao: string | null;
    metodo_pagamento: string | null;
    created_at: string;
    updated_at: string;
    planos: {
      id: string;
      nome: string;
      identificador: string;
      valor: number;
      valor_promocional: number | null;
      ativo: boolean;
    } | null;
  } | null;
  faturas: Array<{
    id: string;
    valor: number;
    status: string;
    metodo_pagamento: string;
    data_vencimento: string;
    data_pagamento: string | null;
    created_at: string;
    planos: { nome: string; identificador: string } | null;
  }>;
  planos: Array<{
    id: string;
    nome: string;
    identificador: string;
    valor: number;
    valor_promocional: number | null;
    ativo: boolean;
  }>;
}

export interface AdminUserLogItem {
  id: string;
  usuario_id: string;
  entidade_tipo: string;
  entidade_id: string;
  acao: string;
  descricao: string;
  meta: Record<string, any>;
  ip_address: string | null;
  created_at: string;
  usuarios?: {
    nome: string;
    telefone: string;
  };
}

export interface AdminUserLogsResponse {
  data: AdminUserLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminConfigItem {
  id: number;
  chave: string;
  valor: string;
}

export interface UpdateUserPayload {
  nome?: string;
  razao_social?: string | null;
  apelido?: string | null;
  email?: string;
  telefone?: string;
  cpfcnpj?: string;
  ativo?: boolean;
  data_nascimento?: string | null;
}

export interface UpdateSubscriptionPayload {
  plano_id?: string;
  status?: string;
  data_vencimento?: string | null;
  trial_ends_at?: string | null;
  valor_promocional?: number | null;
  data_fim_promocao?: string | null;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const BASE = "/admin";

export const adminApi = {
  getStats: () =>
    apiClient.get<AdminDashboardStats>(`${BASE}/dashboard`).then(r => r.data),

  getUsers: (params?: ListUsersParams) =>
    apiClient.get<AdminUserListResponse>(`${BASE}/users`, { params }).then(r => r.data),

  getUserDetails: (id: string) =>
    apiClient.get<AdminUserDetailsResponse>(`${BASE}/users/${id}`).then(r => r.data),

  getUserLogs: (id: string, params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string }) =>
    apiClient.get<AdminUserLogsResponse>(`${BASE}/users/${id}/logs`, { params }).then(r => r.data),

  getLogs: (params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string; search_cpf?: string }) =>
    apiClient.get<AdminUserLogsResponse>(`${BASE}/logs`, { params }).then(r => r.data),

  updateUser: (id: string, data: UpdateUserPayload) =>
    apiClient.patch(`${BASE}/users/${id}`, data).then(r => r.data),

  updateSubscription: (id: string, data: UpdateSubscriptionPayload) =>
    apiClient.patch(`${BASE}/users/${id}/subscription`, data).then(r => r.data),

  getConfigs: () =>
    apiClient.get<AdminConfigItem[]>(`${BASE}/configs`).then(r => r.data),

  updateConfig: (chave: string, valor: string) =>
    apiClient.put(`${BASE}/configs`, { chave, valor }).then(r => r.data),

  getPlans: () =>
    apiClient.get<AdminSaaSPlanItem[]>(`${BASE}/plans`).then(r => r.data),

  updatePlan: (id: string, data: UpdatePlanPayload) =>
    apiClient.patch(`${BASE}/plans/${id}`, data).then(r => r.data),

  createUser: (data: CreateUserPayload) =>
    apiClient.post<CreateUserResponse>(`${BASE}/users`, data).then(r => r.data),

  resetPassword: (id: string) =>
    apiClient.post<{ success: boolean; senha: string }>(`${BASE}/users/${id}/reset-password`).then(r => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(`${BASE}/users/${id}`).then(r => r.data),

  getWhatsappInstances: () =>
    apiClient.get<AdminWhatsappInstanceItem[]>(`${BASE}/whatsapp-instances`).then(r => r.data),
};

export interface AdminWhatsappInstanceItem {
  id: string;
  instance_name: string;
  description: string | null;
  purpose: "TRANSACTIONAL" | "BULK";
  rate_limit_max: number;
  rate_limit_duration: number;
  is_active: boolean;
  is_default_for_purpose: boolean;
  evolution_status?: string;
  evolution_status_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSaaSPlanItem {
  id: string;
  nome: string;
  identificador: string;
  valor: number;
  valor_promocional: number | null;
  ativo: boolean;
}

export interface UpdatePlanPayload {
  valor?: number;
  valor_promocional?: number | null;
}

export interface CreateUserPayload {
  nome: string;
  razao_social?: string;
  email: string;
  telefone: string;
  cpfcnpj: string;
  data_nascimento?: string | null;
  senha: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
}

