import { UserType } from "./enums";

export interface Usuario {
  id: string;
  nome: string;
  apelido?: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  chave_pix?: string;
  tipo_chave_pix?: string;

  ativo?: boolean; // Flag de segurança (conta bloqueada/ativa)
  
  /** @deprecated Use 'tipo' instead. */
  role?: string;
  tipo?: UserType;


  created_at: string;
  updated_at: string;
  status_chave_pix?: string;
  chave_pix_validada_em?: string;
  flags?: any;
  taxa_servico?: number;

  // Configurações de contrato
  assinatura_digital_url?: string;
  config_contrato?: {
    usar_contratos: boolean;
    configurado: boolean;
    multa_atraso: { valor: number; tipo: "percentual" | "fixo" };
    multa_rescisao: { valor: number; tipo: "percentual" | "fixo" };
    clausulas: string[];
  };
}
