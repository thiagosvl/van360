import { RenovacaoMotivoRecusa, RenovacaoReajusteTipo, RenovacaoStatus } from "./enums";

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
  valor_cobranca_atual: number;
  dia_vencimento_atual?: number | null;
  escola_atual_id?: string | null;
  escola_atual_nome?: string | null;
  periodo_atual?: string | null;
  modalidade_atual?: string | null;
  turma_atual?: string | null;
  nome_professor_atual?: string | null;
  isento_atual?: boolean;
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
  novo_isento: boolean;
  motivo_recusa?: RenovacaoMotivoRecusa | null;
  justificativa_recusa?: string | null;
  quem_recusou?: string | null;
  notificacao_enviada_em?: string | null;
  token_publico?: string | null;
  observacoes_pais?: string | null;
}

export interface RenovacaoDashboardResponse {
  kpis: RenovacaoKPIs;
  passageiros: RenovacaoPassageiroItem[];
}

export interface ReajusteLotePayload {
  ano_destino: number;
  tipo: RenovacaoReajusteTipo;
  valor: number;
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
  motivo_recusa?: RenovacaoMotivoRecusa | null;
  justificativa_recusa?: string | null;
  quem_recusou?: "motorista" | "responsavel" | null;
}

export interface VirarAnoLetivoPayload {
  ano_destino: number;
}
