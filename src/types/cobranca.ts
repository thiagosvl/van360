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
  passageiros: Partial<Passageiro>;
  desativar_lembretes?: boolean;
  pagamento_manual?: boolean;
}