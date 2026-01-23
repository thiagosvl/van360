import { UserType, WhatsappStatus } from "./enums";

export interface Usuario {
  id: string;
  nome: string;
  apelido: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  chave_pix?: string;
  tipo_chave_pix?: string;
  auth_uid: string;
  ativo?: boolean; // Flag de segurança (conta bloqueada/ativa)
  
  /** @deprecated Use 'tipo' instead. */
  role?: string;
  tipo?: UserType;
  whatsapp_status?: WhatsappStatus;

  created_at: string;
  updated_at: string;
  assinaturas_usuarios?: any;
  status_chave_pix?: string;
  chave_pix_validada_em?: string;
  nome_titular_pix_validado?: string;
  cpf_cnpj_titular_pix_validado?: string;
  flags?: {
      is_trial_ativo: boolean;
      dias_restantes_trial: number | null;
      dias_restantes_assinatura: number | null;
      trial_dias_total: number;
      whatsapp_status: string | null;
      ultima_fatura: string | null;
      ultima_fatura_id: string | null;
      limite_franquia_atingido: boolean;
      pix_key_configurada: boolean;
  };
  plano?: any;
  assinatura?: any;
}