import { apiClient } from "../client";
import { DriverContractConfigStatus, WhatsappStatus } from "@/types/enums";

export interface AdminDashboardStats {
  totalMotoristas: number;
  totalPassageiros: number;
  receitaTotal: number;
  assinaturas: {
    trial: number;
    active: number;
    vitalicio: number;
    past_due: number;
    expired: number;
    canceled: number;
  };
  canaisAquisicao?: Record<string, number>;
  whatsappStatus?: WhatsappStatus;
  contratosStats?: {
    totalContratos: number;
    contratosAssinados: number;
    contratosPendentes: number;
    contratosSubstituidos: number;
    valorTotalContratos: number;
    motoristasConfigurados?: number;
    motoristasAtivos?: number;
    motoristasPausados?: number;
    motoristasNaoConfigurados?: number;
    motoristasConfig: {
      ativo: number;
      inativo: number;
      nao_configurado: number;
    };
  };
  indicacoesStats?: {
    total: number;
    concluidas: number;
    pendentes: number;
    taxaConversao: number;
    diasBonusConcedidos: number;
    motoristasIndicados: number;
  };
  recentUsers: Array<{
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    created_at: string;
    tipo: string;
    assinaturas?: Array<{
      status: string;
      data_vencimento?: string | null;
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

export interface AdminUserPassengerItem {
  id: string;
  nome: string;
  foto_url: string | null;
  data_nascimento: string | null;
  serie_ano: string | null;
  turma: string | null;
  turno: string | null;
  periodo_cobranca: string | null;
  nome_responsavel: string | null;
  cpf_responsavel: string | null;
  telefone_responsavel: string | null;
  parentesco_responsavel: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  valor_mensalidade?: number | null;
  dia_vencimento?: number | null;
  ativo: boolean;
  escolas?: { nome: string } | null;
  veiculos?: { modelo: string; placa: string } | null;
  created_at: string;
}

export interface AdminUserPendingRequestItem {
  id: string;
  nome: string;
  nome_responsavel: string | null;
  telefone_responsavel: string | null;
  email_responsavel: string | null;
  serie_ano: string | null;
  turma: string | null;
  turno: string | null;
  endereco: string | null;
  numero?: string | null;
  bairro: string | null;
  cidade: string | null;
  escolas?: { nome: string } | null;
  created_at: string;
}

export interface AdminUserVehicleItem {
  id: string;
  modelo: string;
  placa: string;
  marca: string | null;
  ano_fabricacao: number | null;
  ano_modelo: number | null;
  capacidade_passageiros: number | null;
  renavam: string | null;
  cor: string | null;
  ativo: boolean;
  created_at: string;
}

export interface AdminUserSchoolItem {
  id: string;
  nome: string;
  logradouro?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  uf?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato_nome: string | null;
  horario_entrada_manha: string | null;
  horario_saida_manha: string | null;
  horario_entrada_tarde: string | null;
  horario_saida_tarde: string | null;
  horario_entrada_noite: string | null;
  horario_saida_noite: string | null;
  ativo: boolean;
  created_at: string;
}

export interface AdminUserContractItem {
  id: string;
  usuario_id: string;
  passageiro_id: string;
  status: string;
  minuta_url?: string | null;
  contrato_final_url?: string | null;
  valor_total?: number | null;
  valor_parcela?: number | null;
  qtd_parcelas?: number | null;
  created_at: string;
  assinado_em?: string | null;
  passageiros?: {
    id: string;
    nome: string;
    cpf?: string | null;
    responsavel_nome?: string | null;
    responsavel_telefone?: string | null;
  } | null;
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
    chave_pix?: string | null;
    chave_pix_tipo?: string | null;
    canal_aquisicao?: string | null;
    cep?: string | null;
    logradouro?: string | null;
    endereco?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    uf?: string | null;
    assinatura_digital_url?: string | null;
    config_contrato?: {
      usar_contratos?: boolean;
      multa_atraso?: { valor: number; tipo: string };
      multa_rescisao?: { valor: number; tipo: string };
    } | null;
  };
  kpis?: {
    veiculosCount: number;
    escolasCount: number;
    passageirosCount: number;
    solicitacoesPendentesCount: number;
    contratosCount?: number;
    contratosAssinadosCount?: number;
    contratosPendentesCount?: number;
    valorTotalContratos?: number;
    statusConfiguracaoContrato?: DriverContractConfigStatus;
  };
  referralSummary?: {
    total: number;
    completed: number;
    pending: number;
    referralCode: string;
    referralLink: string;
    bonusDays: number;
    discountPct: number;
    hasActiveDiscount: boolean;
    hasIndicator: boolean;
  };
  passageiros?: AdminUserPassengerItem[];
  prePassageiros?: AdminUserPendingRequestItem[];
  veiculos?: AdminUserVehicleItem[];
  escolas?: AdminUserSchoolItem[];
  contratos?: AdminUserContractItem[];
  assinatura: {
    id: string;
    usuario_id: string;
    plano_id: string;
    status: string;
    data_inicio: string;
    data_vencimento: string | null;
    trial_ends_at: string | null;
    valor_base?: number | null;
    valor_promocional?: number | null;
    valor_base_mensal?: number | null;
    valor_base_anual?: number | null;
    valor_promocional_mensal?: number | null;
    valor_promocional_anual?: number | null;
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
  valor_base_mensal?: number | null;
  valor_base_anual?: number | null;
  valor_promocional_mensal?: number | null;
  valor_promocional_anual?: number | null;
  data_fim_promocao?: string | null;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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

const BASE = "/admin";

export const adminUserApi = {
  getStats: () =>
    apiClient.get<AdminDashboardStats>(`${BASE}/dashboard`).then(r => r.data),

  getUsers: (params?: ListUsersParams) =>
    apiClient.get<AdminUserListResponse>(`${BASE}/users`, { params }).then(r => r.data),

  getUserDetails: (id: string) =>
    apiClient.get<AdminUserDetailsResponse>(`${BASE}/users/${id}`).then(r => r.data),

  updateUser: (id: string, data: UpdateUserPayload) =>
    apiClient.patch(`${BASE}/users/${id}`, data).then(r => r.data),

  updateSubscription: (id: string, data: UpdateSubscriptionPayload) =>
    apiClient.patch(`${BASE}/users/${id}/subscription`, data).then(r => r.data),

  createUser: (data: CreateUserPayload) =>
    apiClient.post<CreateUserResponse>(`${BASE}/users`, data).then(r => r.data),

  resetPassword: (id: string) =>
    apiClient.post<{ success: boolean; senha: string }>(`${BASE}/users/${id}/reset-password`).then(r => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(`${BASE}/users/${id}`).then(r => r.data),
};
