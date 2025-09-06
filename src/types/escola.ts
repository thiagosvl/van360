export interface Escola {
  id: string;
  nome: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}