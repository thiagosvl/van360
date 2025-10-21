export interface Passageiro {
  id?: string;
  nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  genero: string;
  nome_responsavel: string;
  email_responsavel: string;
  telefone_responsavel: string;
  cpf_responsavel: string;
  valor_cobranca: number;
  dia_vencimento: number;
  asaas_customer_id?: string;
  created_at?: string;
  updated_at?: string;
  escola_id?: string;
  usuario_id?: string;
  ativo?: boolean;
  referencia?: string;
  observacoes? : string;
  escolas?: { nome: string };
  emitir_cobranca_mes_atual? : boolean;
}