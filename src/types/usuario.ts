import { UserType, ContractMultaTipo, DispositivoCadastro } from "./enums";
import { ContractSection } from "../constants/defaults";

export interface MetadadosCadastroUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface MetadadosCadastroData {
  ip?: string;
  user_agent?: string;
  referrer?: string;
  utm?: MetadadosCadastroUtm;
}

export interface Usuario {
  id: string;
  nome: string;
  razao_social?: string;
  apelido?: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  data_nascimento?: string;
  chave_pix?: string;
  tipo_chave_pix?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  canal_aquisicao?: string;
  dispositivo_cadastro?: DispositivoCadastro;
  metadados_cadastro?: MetadadosCadastroData;
  veiculo_id?: string;
  conta_pai_id?: string;

  ativo?: boolean; // Flag de segurança (conta bloqueada/ativa)

  /** @deprecated Use 'tipo' instead. */
  role?: string;
  tipo?: UserType;


  created_at: string;
  updated_at: string;
  flags?: any;

  // Configurações de contrato
  assinatura_digital_url?: string;
  config_contrato?: {
    usar_contratos: boolean;
    multa_atraso: { valor: number; tipo: ContractMultaTipo };
    juros_atraso: { valor: number; tipo: ContractMultaTipo };
    multa_rescisao: { valor: number; tipo: ContractMultaTipo };
    secoes?: ContractSection[];
    clausulas?: string[];
  };
}
