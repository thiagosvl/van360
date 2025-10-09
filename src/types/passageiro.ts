export interface Passageiro {
  id: string;
  nome: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
  genero: string;
  observacoes? : string;
  nome_responsavel: string;
  email_responsavel: string;
  telefone_responsavel: string;
  cpf_responsavel: string;
  valor_mensalidade: number;
  dia_vencimento: number;
  escola_id?: string;
  usuario_id?: string;
  asaas_customer_id?: string;
  created_at: string;
  updated_at: string;
  escolas?: { nome: string };
  ativo: boolean;
}