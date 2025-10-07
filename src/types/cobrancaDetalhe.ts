export interface CobrancaDetalhe {
  id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  tipo_pagamento: string | null;
  status: "pago" | "pendente";
  desativar_lembretes: boolean;
  passageiro_id: string;
  passageiro_nome: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  asaas_payment_id: string | null;
  asaas_bankslip_url: string | null;
  asaas_invoice_url: string | null;
  cpf_responsavel: string;
  escola_id: string;
  origem: string;
  pagamento_manual: boolean;
  escola_nome: string;
}