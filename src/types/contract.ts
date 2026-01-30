import { ContratoStatus } from "./enums";

export interface Contrato {
  id: string;
  usuario_id: string;
  passageiro_id: string;
  token_acesso: string;
  status: ContratoStatus;
  provider: 'inhouse' | 'assinafy';
  minuta_url: string;
  contrato_final_url?: string;
  contrato_url?: string;
  dados_contrato: any;
  created_at: string;
  assinado_em?: string;
}

export interface CreateContratoDTO {
  passageiroId: string;
  provider?: 'inhouse' | 'assinafy';
  valorMensal?: number;
  diaVencimento?: number;
  dataInicio?: string;
  dataFim?: string;
  modalidade?: string;
}
