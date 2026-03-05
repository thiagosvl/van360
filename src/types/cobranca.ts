import { RepasseState } from "./enums";
import { Passageiro } from "./passageiro";

export interface Repasse {
  id: string;
  cobranca_id: string;
  usuario_id: string;
  valor: number;
  estado: RepasseState;
  versao: number;
  gateway_group_id: string | null;
  gateway_item_id: string | null;
  gateway_raw_status: string | null;
  gateway: string | null;
  tentativa: number;
  max_tentativas: number;
  erro_mensagem: string | null;
  erro_codigo: string | null;
  created_at: string;
  updated_at: string;
  liquidado_at: string | null;
}

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
  status_repasse?: RepasseState | "SEM_REPASSE";
  repasse?: Repasse | null;
  valor_a_repassar?: number;
  gateway_txid?: string;
  data_envio_ultima_notificacao?: string;
  qr_code_payload?: string;
  location_url?: string;
  recibo_url?: string;
}