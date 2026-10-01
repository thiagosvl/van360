import { RenovacaoReajusteTipo, RenovacaoStatus } from "./enums";

export interface ListRenovacoesParams {
  ano_destino?: number;
  status?: string;
  escola_id?: string;
  periodo?: string;
  search?: string;
}

export interface RenovacaoKPIs {
  faturamento_atual: number;
  faturamento_projetado: number;
  percentual_crescimento: number;
  contadores: {
    total_ativos: number;
    confirmados: number;
    pendentes: number;
    nao_notificados: number;
    saidas: number;
  };
}

export interface RenovacaoPassageiroItem {
  passageiro_id: string;
  nome: string;
  foto_url?: string | null;
  valor_cobranca_atual: number;
  dia_vencimento_atual?: number | null;
  escola_id_atual?: string | null;
  escola_nome_atual?: string | null;
  periodo_atual?: string | null;
  modalidade_atual?: string | null;
  turma_atual?: string | null;
  nome_professor_atual?: string | null;
  veiculo_id_atual?: string | null;
  isento_atual?: boolean;
  data_inicio_transporte_atual?: string | null;
  data_fim_transporte_atual?: string | null;
  data_inicio_cobranca_atual?: string | null;
  data_fim_cobranca_atual?: string | null;
  responsavel_principal?: {
    id?: string;
    nome?: string | null;
    telefone?: string | null;
    cpf?: string | null;
    email?: string | null;
    parentesco?: string | null;
  } | null;

  reserva_id?: string | null;
  ano_destino: number;
  status: RenovacaoStatus | "nao_notificado";
  novo_valor_cobranca: number;
  novo_dia_vencimento?: number | null;
  nova_escola_id?: string | null;
  nova_escola_nome?: string | null;
  novo_periodo?: string | null;
  nova_modalidade?: string | null;
  nova_turma?: string | null;
  novo_nome_professor?: string | null;
  novo_veiculo_id?: string | null;
  nova_data_inicio_transporte?: string | null;
  nova_data_fim_transporte?: string | null;
  nova_data_inicio_cobranca?: string | null;
  nova_data_fim_cobranca?: string | null;
  notificacao_enviada_em?: string | null;
  token_publico?: string | null;
}

export interface RenovacaoDashboardResponse {
  kpis: RenovacaoKPIs;
  passageiros: RenovacaoPassageiroItem[];
}

export type RenovacoesListResponse = RenovacaoDashboardResponse;

export interface ReajusteLotePayload {
  ano_destino: number;
  tipo?: RenovacaoReajusteTipo;
  tipo_reajuste?: RenovacaoReajusteTipo;
  valor?: number;
  valor_reajuste?: number;
  escola_id?: string | null;
  escola_ids?: string[] | null;
  data_inicio_transporte?: string;
  data_fim_transporte?: string;
  data_inicio_cobranca?: string;
  data_fim_cobranca?: string;
}

export interface UpdateRenovacaoPayload {
  ano_destino: number;
  status?: RenovacaoStatus;
  novo_valor_cobranca?: number | null;
  novo_dia_vencimento?: number | null;
  nova_escola_id?: string | null;
  novo_periodo?: string | null;
  nova_modalidade?: string | null;
  nova_turma?: string | null;
  novo_nome_professor?: string | null;
  nova_data_inicio_transporte?: string;
  nova_data_fim_transporte?: string;
  nova_data_inicio_cobranca?: string;
  nova_data_fim_cobranca?: string;
  novo_veiculo_id?: string | null;
  novo_isento?: boolean;
}

export interface VirarAnoLetivoPayload {
  ano_destino: number;
}

export interface PublicRenovacaoConditionItem<T> {
  atual: T;
  novo: T;
  alterado: boolean;
}

export interface PublicRenovacaoResponse {
  token_publico: string;
  status: RenovacaoStatus;
  confirmado_em: string | null;
  recusado_em: string | null;
  ano_origem: number;
  ano_destino: number;
  motorista: {
    id: string;
    nome: string;
    apelido?: string | null;
    telefone?: string | null;
    logo_url?: string | null;
    usar_contratos: boolean;
  };
  passageiro: {
    id: string;
    nome: string;
    data_nascimento?: string | null;
    turma?: string | null;
    sala?: string | null;
    nome_professor?: string | null;
    observacoes?: string | null;
    foto_url?: string | null;
  };
  responsavel?: {
    id?: string;
    nome?: string | null;
    telefone?: string | null;
    cpf?: string | null;
    email?: string | null;
    parentesco?: string | null;
    cep?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    complemento?: string | null;
    referencia?: string | null;
  } | null;
  observacoes_pais?: string | null;
  condicoes: {
    valor: PublicRenovacaoConditionItem<number>;
    dia_vencimento: PublicRenovacaoConditionItem<number | null>;
    escola: PublicRenovacaoConditionItem<string | null>;
    periodo: PublicRenovacaoConditionItem<string | null>;
    modalidade: PublicRenovacaoConditionItem<string | null>;
    turma?: PublicRenovacaoConditionItem<string | null>;
    nome_professor?: PublicRenovacaoConditionItem<string | null>;
    data_inicio_transporte?: string | null;
    data_fim_transporte?: string | null;
    data_inicio_cobranca?: string | null;
    data_fim_cobranca?: string | null;
    qtd_parcelas?: number;
  };
  contrato?: {
    id: string;
    status: string;
    token_acesso: string;
  } | null;
}

export interface AtualizarDadosPublicosPayload {
  responsavel?: {
    nome?: string;
    telefone?: string;
    cpf?: string;
    email?: string;
    parentesco?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    complemento?: string;
    referencia?: string;
  };
  passageiro?: {
    turma?: string;
    sala?: string;
    nome_professor?: string;
    observacoes?: string;
  };
}

export interface ResponderRenovacaoPayload {
  status: "confirmado" | "recusado";
  observacoes_pais?: string | null;
}

export interface ResponderRenovacaoResponse {
  status: "confirmado" | "recusado";
  ano_destino: number;
  contrato?: {
    id: string;
    token_acesso: string;
    link_assinatura: string;
  } | null;
}

export interface NotificarRenovacaoResponse {
  success: boolean;
  token_publico: string;
  notificacao_enviada_em: string;
}

export interface NotificarLoteRenovacaoResponse {
  total: number;
  enviados: number;
  falhas: number;
}

