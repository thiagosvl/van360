import { ContratoProvider, ContratoStatus } from "./enums";

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
  dados_contrato: any;
  created_at: string;
  assinado_em?: string | null;
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
