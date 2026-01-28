import { Passageiro } from "./passageiro";

export interface Cobranca {
  id: string;
  passageiro_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: string;
  passageiro?: Partial<Passageiro>;
  desativar_lembretes?: boolean;
  pagamento_manual?: boolean;
  origem: string;
  status_repasse?: "PENDENTE" | "PROCESSANDO" | "REPASSADO" | "FALHA_REPASSE" | "SEM_REPASSE";
  valor_a_repassar?: number;
  gateway_txid?: string;
  data_envio_ultima_notificacao?: string;
  qr_code_payload?: string;
  location_url?: string;
  recibo_url?: string;
}