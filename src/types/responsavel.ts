export interface ResponsavelPassageiro {
  id: string;
  nome: string;
  motorista_nome: string;
}

export interface CheckPhoneResponse {
  hasPin: boolean;
  totalPassageiros: number;
}

export interface ResponsavelLoginResponse {
  token: string;
  passageiros: ResponsavelPassageiro[];
}

export interface ResponsavelCarteirinhaData {
  id: string;
  nome: string;
  ativo: boolean;
  cpf_responsavel?: string | null;
  email_responsavel?: string | null;
}
