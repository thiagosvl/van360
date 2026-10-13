import { CobrancaStatus, CobrancaTipoPagamento } from "./enums";
import { Passageiro } from "./passageiro";

export interface Cobranca {
  id: string;
  usuario_id?: string;
  passageiro_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: CobrancaStatus;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: CobrancaTipoPagamento;
  passageiro?: Partial<Passageiro>;
  desativar_lembretes?: boolean;
  pagamento_manual?: boolean;
  valor_pago?: number;
  data_envio_ultima_notificacao?: string;
  recibo_url?: string;
  isProjection?: boolean;
  ano_letivo?: number;
  observacao?: string | null;
  provedor?: string | null;
  provedor_cobranca_id?: string | null;
  pix_copia_cola?: string | null;
  pix_qrcode_url?: string | null;
  pix_expiracao?: string | null;
  valor_taxa_plataforma?: number | null;
  repasse_em_processamento?: boolean | null;
}