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
  
  /** @deprecated Use 'tipo' instead. */
  role?: string;
  tipo?: UserType;
  whatsapp_status?: WhatsappStatus;

  created_at: string;
  updated_at: string;
  assinaturas_usuarios?: any;
  status_chave_pix?: string;
  // Computed/Joined fields
  estatisticas?: {
    total_passageiros: number;
    [key: string]: any;
  };
  plano?: any;
  assinatura?: any;
}