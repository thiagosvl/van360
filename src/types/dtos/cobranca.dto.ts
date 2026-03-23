import { CobrancaOrigem, CobrancaStatus, CobrancaTipoPagamento } from "../enums";

export interface CreateCobrancaDTO {
  passageiro_id: string;
  usuario_id: string;
  valor: number;
  data_vencimento: string;
  status: CobrancaStatus;
  mes: number;
  ano: number;
  origem: CobrancaOrigem;
  tipo_pagamento?: CobrancaTipoPagamento;
  data_pagamento?: string;
  valor_pago?: number;
  pagamento_manual?: boolean;
}

export interface UpdateCobrancaDTO {
  valor?: number;
  status?: CobrancaStatus;
  data_vencimento?: string;
  data_pagamento?: string;
  tipo_pagamento?: CobrancaTipoPagamento;
  valor_pago?: number;
  recibo_url?: string;
  desativar_lembretes?: boolean;
}

export interface RegistrarPagamentoManualDTO {
  valor_pago: number | string;
  data_pagamento: string;
  tipo_pagamento: CobrancaTipoPagamento;
}
