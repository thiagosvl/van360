export interface Escola {
  id: string;
  nome: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string | null;
  referencia?: string | null;
  complemento?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  passageiros_ativos_count?: number;
  endereco?: string;
  telefone?: string;
}