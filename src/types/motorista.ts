export interface Motorista {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  auth_uid?: string;
  asaas_subaccount_id?: string;
  asaas_subaccount_api_key?: string;
  asaas_root_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMotoristaData {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email?: string;
}

export interface UpdateMotoristaData {
  nome: string;
  telefone: string;
  email?: string;
}