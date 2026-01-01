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
  role?: string;
  created_at: string;
  updated_at: string;
  assinaturas_usuarios?: any;
  // Computed/Joined fields
  estatisticas?: {
    total_passageiros: number;
    [key: string]: any;
  };
  plano?: any;
  assinatura?: any;
}