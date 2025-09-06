export interface Passageiro {
  id: string;
  nome: string;
  endereco: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  valor_mensalidade: number;
  dia_vencimento: number;
  escola_id?: string;
  created_at: string;
  updated_at: string;
  escolas?: { nome: string };
  ativo: boolean;
}