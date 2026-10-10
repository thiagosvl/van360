import { UserType } from "./enums";

export interface VeiculoMembro {
  id: string;
  placa: string;
  marca?: string;
  modelo: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  apelido?: string | null;
  razao_social?: string | null;
  email: string;
  telefone: string;
  cpfcnpj: string;
  tipo: UserType;
  ativo: boolean;
  conta_pai_id: string;
  veiculo_id: string;
  created_at: string;
  veiculos?: VeiculoMembro | null;
}
