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
  txid_pix?: string;
  data_envio_notificacao?: string;
  qr_code_payload?: string;
  url_qr_code?: string;
  recibo_url?: string;
}