export interface Usuario {
  id: string;
  nome: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  auth_uid: string;
  asaas_subaccount_id?: string;
  asaas_subaccount_api_key?: string;
  asaas_root_customer_id?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}