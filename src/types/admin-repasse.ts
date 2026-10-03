import type { Enums } from "@/integrations/supabase/types";

export type StatusRepasse = Enums<"status_repasse_enum">;
export type ProvedorPagamento = Enums<"provedor_pagamento_enum">;
export type ModalidadeCobranca = Enums<"modalidade_cobranca_enum">;

export interface AdminRepasseMotorista {
  id: string;
  nome: string;
  apelido: string | null;
  telefone: string | null;
  cpfcnpj: string | null;
}

export interface AdminRepassePassageiro {
  id: string;
  nome: string;
}

export interface AdminRepasseCobranca {
  id: string;
  valor: number;
  status: string;
  mes: number;
  ano: number;
  data_vencimento: string;
}

export interface AdminRepasseItem {
  id: string;
  cobranca_id: string;
  motorista_id: string;
  passageiro_id: string;
  provedor: ProvedorPagamento;
  valor_bruto: number;
  taxa_plataforma: number;
  tarifa_gateway_pix_in: number;
  tarifa_gateway_saque: number;
  valor_liquido_motorista: number;
  transacao_provedor_id: string;
  saque_provedor_id: string | null;
  end_to_end_id_in: string | null;
  end_to_end_id_out: string | null;
  status_repasse: StatusRepasse;
  tentativas: number;
  ultimo_erro: string | null;
  data_pagamento_pai: string | null;
  data_repasse_motorista: string | null;
  created_at: string;
  updated_at: string;
  motorista: AdminRepasseMotorista;
  passageiro: AdminRepassePassageiro;
  cobranca: AdminRepasseCobranca;
}

export interface AdminRepasseKpis {
  total_repassado: number;
  total_taxa_plataforma: number;
  total_sucesso: number;
  total_falhas: number;
  total_pendentes: number;
}

export interface AdminRepassesListResponse {
  data: AdminRepasseItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RepasseFiltersState {
  status: StatusRepasse | "TODOS";
  search: string;
  motoristaId?: string;
  dataInicio: string;
  dataFim: string;
}

export interface MotoristaConfiguracaoFinanceira {
  id: string;
  usuario_id: string;
  chave_pix_repasse: string | null;
  tipo_chave_pix: string | null;
  cobranca_automatica_ativa: boolean;
  modalidade_cobranca: ModalidadeCobranca;
  taxa_personalizada: number | null;
  repassar_taxa_pais_padrao: boolean;
  enviar_recibo_automatico: boolean;
  subconta_provedor_id: string | null;
  baas_status: string;
  created_at: string;
  updated_at: string;
}
