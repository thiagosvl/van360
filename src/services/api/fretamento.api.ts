import { apiClient } from "./client";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type Fretamento = Tables<"fretamentos">;
export type FretamentoInsert = TablesInsert<"fretamentos">;
export type FretamentoUpdate = TablesUpdate<"fretamentos">;
export type FretamentoVeiculo = Tables<"fretamento_veiculos">;
export type FretamentoPagamento = Tables<"fretamento_pagamentos">;
export type FretamentoParticipante = Tables<"fretamento_participantes">;

export type FretamentoTipo = Enums<"fretamento_tipo_enum">;
export type FretamentoStatus = Enums<"fretamento_status_enum">;
export type FretamentoPagamentoStatus = Enums<"fretamento_pagamento_status_enum">;
export type ParticipantePagamentoStatus = Enums<"participante_pagamento_status_enum">;
export type TipoPagamento = Enums<"tipo_pagamento_enum">;

export interface FretamentoItemLista extends Fretamento {
  veiculos: Array<{
    id: string;
    veiculo_id: string;
    placa?: string | null;
    modelo?: string | null;
    vagas_capacidade?: number | null;
  }>;
  total_pago: number;
  saldo_restante: number;
  vagas_ocupadas: number;
}

export interface FretamentoDetalhes extends Fretamento {
  veiculos: Array<{
    id: string;
    veiculo_id: string;
    placa?: string | null;
    modelo?: string | null;
    vagas_capacidade?: number | null;
  }>;
  pagamentos: FretamentoPagamento[];
  participantes: FretamentoParticipante[];
  total_pago: number;
  saldo_restante: number;
  vagas_ocupadas: number;
}

export interface ResumoFinanceiroFretamento {
  mes: number;
  ano: number;
  total_faturado_previsto: number;
  total_recebido: number;
  total_a_receber: number;
  quantidade_fretamentos: number;
  quantidade_passeios: number;
}

export interface CriarFretamentoPayload {
  tipo: FretamentoTipo;
  titulo: string;
  origem?: string | null;
  destino: string;
  data_inicio: string;
  data_fim?: string | null;
  contratante_nome?: string | null;
  contratante_telefone?: string | null;
  valor_total?: number;
  valor_por_pessoa?: number | null;
  vagas_totais?: number | null;
  chave_pix?: string | null;
  observacoes?: string | null;
  veiculos_ids?: string[];
  sinal_inicial?: {
    valor: number;
    tipo_pagamento: TipoPagamento;
    data_pagamento?: string;
  } | null;
}

export interface AtualizarFretamentoPayload {
  titulo?: string;
  origem?: string | null;
  destino?: string;
  data_inicio?: string;
  data_fim?: string | null;
  contratante_nome?: string | null;
  contratante_telefone?: string | null;
  valor_total?: number;
  valor_por_pessoa?: number | null;
  vagas_totais?: number | null;
  chave_pix?: string | null;
  observacoes?: string | null;
  status?: FretamentoStatus;
  veiculos_ids?: string[];
}

export interface RegistrarPagamentoPayload {
  valor: number;
  tipo_pagamento: TipoPagamento;
  data_pagamento?: string;
  descricao?: string | null;
}

export interface AdicionarParticipantePayload {
  passageiro_id?: string | null;
  nome: string;
  is_proprio_responsavel?: boolean;
  responsavel_nome?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  valor?: number;
  observacoes?: string | null;
}

export interface PasseioPublicoInfo {
  id: string;
  titulo: string;
  origem?: string | null;
  destino: string;
  data_inicio: string;
  data_fim?: string | null;
  valor_por_pessoa?: number | null;
  vagas_totais?: number | null;
  vagas_ocupadas: number;
  vagas_disponiveis?: number | null;
  chave_pix?: string | null;
  observacoes?: string | null;
  motorista_nome?: string | null;
  motorista_telefone?: string | null;
}

const endpoint = "/fretamentos";

export const fretamentoApi = {
  listar: (params: { mes: number; ano: number; tipo?: FretamentoTipo; status?: FretamentoStatus }) =>
    apiClient.get<FretamentoItemLista[]>(endpoint, { params }).then((res) => res.data),

  resumoFinanceiro: (params: { mes: number; ano: number }) =>
    apiClient.get<ResumoFinanceiroFretamento>(`${endpoint}/resumo-financeiro`, { params }).then((res) => res.data),

  obterPorId: (id: string) =>
    apiClient.get<FretamentoDetalhes>(`${endpoint}/${id}`).then((res) => res.data),

  criar: (payload: CriarFretamentoPayload) =>
    apiClient.post<FretamentoDetalhes>(endpoint, payload).then((res) => res.data),

  atualizar: (id: string, payload: AtualizarFretamentoPayload) =>
    apiClient.put<FretamentoDetalhes>(`${endpoint}/${id}`, payload).then((res) => res.data),

  deletar: (id: string) =>
    apiClient.delete<{ success: boolean }>(`${endpoint}/${id}`).then((res) => res.data),

  registrarPagamento: (fretamentoId: string, payload: RegistrarPagamentoPayload) =>
    apiClient.post<FretamentoDetalhes>(`${endpoint}/${fretamentoId}/pagamentos`, payload).then((res) => res.data),

  deletarPagamento: (fretamentoId: string, pagamentoId: string) =>
    apiClient.delete<FretamentoDetalhes>(`${endpoint}/${fretamentoId}/pagamentos/${pagamentoId}`).then((res) => res.data),

  adicionarParticipante: (fretamentoId: string, payload: AdicionarParticipantePayload) =>
    apiClient.post<FretamentoParticipante>(`${endpoint}/${fretamentoId}/participantes`, payload).then((res) => res.data),

  atualizarStatusParticipante: (
    fretamentoId: string,
    participanteId: string,
    payload: { status_pagamento: ParticipantePagamentoStatus; tipo_pagamento?: TipoPagamento | null }
  ) =>
    apiClient
      .patch<FretamentoDetalhes>(`${endpoint}/${fretamentoId}/participantes/${participanteId}`, payload)
      .then((res) => res.data),

  removerParticipante: (fretamentoId: string, participanteId: string) =>
    apiClient
      .delete<FretamentoDetalhes>(`${endpoint}/${fretamentoId}/participantes/${participanteId}`)
      .then((res) => res.data),

  obterPublico: (slug: string) =>
    apiClient.get<PasseioPublicoInfo>(`${endpoint}/publico/${slug}`).then((res) => res.data),

  inscreverPublico: (slug: string, payload: AdicionarParticipantePayload) =>
    apiClient.post<FretamentoParticipante>(`${endpoint}/publico/${slug}/inscrever`, payload).then((res) => res.data),
};
