import { CobrancaStatus, CobrancaOrigem, CobrancaTipoPagamento } from "./enums";
import { Passageiro } from "./passageiro";

export interface Cobranca {
  id: string;
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
  origem: CobrancaOrigem;
  valor_pago?: number;
  data_envio_ultima_notificacao?: string;
  recibo_url?: string;
}