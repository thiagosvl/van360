import { ContratoProvider, ContratoStatus } from "./enums";

import { Passageiro, Responsavel } from "./passageiro";

export interface Contrato {
  id: string;
  usuario_id: string;
  passageiro_id: string;
  token_acesso: string;
  status: ContratoStatus;
  provider: ContratoProvider | string;
  minuta_url?: string | null;
  contrato_final_url?: string | null;
  contrato_url?: string | null;
  dados_contrato: Record<string, unknown>;
  created_at: string;
  assinado_em?: string | null;
}

export interface ContratoListItem {
  id: string;
  passageiro_id?: string;
  nome?: string;
  tipo?: 'contrato' | 'passageiro';
  status?: ContratoStatus | string | null;
  status_contrato?: ContratoStatus | string | null;
  contrato_id?: string | null;
  valor_parcela?: number | null;
  valor_cobranca?: number | null;
  provider?: ContratoProvider | string | null;
  token_acesso?: string | null;
  minuta_url?: string | null;
  contrato_final_url?: string | null;
  contrato_url?: string | null;
  created_at?: string;
  assinado_em?: string | null;
  dados_contrato?: {
    valorMensal?: number;
    diaVencimento?: number;
    [key: string]: unknown;
  } | null;
  passageiro?: Passageiro | null;
  responsavel_principal?: Responsavel | null;
}

export interface CreateContratoDTO {
  passageiroId: string;
  provider?: ContratoProvider;
  valorMensal?: number;
  diaVencimento?: number;
  dataInicio?: string;
  dataFim?: string;
  modalidade?: string;
}

export interface ImportContratoDTO {
  passageiroId: string;
  arquivoBase64: string;
  nomeArquivo: string;
}
