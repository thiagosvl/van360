import { Responsavel } from "./passageiro";

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

export interface ResponsavelCobrancaItem {
  id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  recibo_url?: string | null;
  desativar_lembretes?: boolean;
  isProjection?: boolean;
}

export interface ResponsavelAusenciaItem {
  id: string;
  data_ausencia: string;
  rota_id?: string | null;
  sentido?: string | null;
  periodo?: string | null;
  motivo?: string | null;
  created_at?: string | null;
  rota?: { id: string; nome: string } | null;
}

export interface RegistrarAusenciaPayload {
  data_ausencia: string;
  rota_id?: string;
  periodo?: string;
  motivo?: string;
}


export interface ResponsavelContratoItem {
  id: string;
  status: string;
  minuta_url?: string | null;
  contrato_final_url?: string | null;
  documento_url?: string | null;
  pdf_url?: string | null;
  token_acesso?: string | null;
  created_at?: string | null;
}

export interface ResponsavelAdicionalItem {
  id: string;
  passageiro_id?: string;
  nome: string;
  telefone?: string | null;
  cpf?: string | null;
  email?: string | null;
  parentesco?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  referencia?: string | null;
  complemento?: string | null;
  pin_acesso?: string | null;
}

export interface ResponsavelRotaItem {
  id: string;
  nome: string;
  periodo?: string | null;
  turno?: string | null;
  tipo?: string | null;
}

export interface ResponsavelCarteirinhaData {
  id: string;
  usuario_id?: string;
  nome: string;
  genero?: string | null;
  data_nascimento?: string | null;
  data_inicio_transporte?: string | null;
  data_fim_transporte?: string | null;
  valor_cobranca?: number | null;
  dia_vencimento?: number | null;
  data_inicio_cobranca?: string | null;
  data_fim_cobranca?: string | null;
  created_at?: string | null;
  periodo?: string | null;
  modalidade?: string | null;
  turma?: string | null;
  nome_professor?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  complemento?: string | null;
  referencia?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  isento?: boolean;
  token_acesso?: string | null;
  responsavel_principal?: Responsavel | null;
  motorista_nome?: string | null;
  motorista_telefone?: string | null;
  escola_nome?: string | null;
  veiculo_placa?: string | null;
  veiculo_modelo?: string | null;
  cobrancas?: ResponsavelCobrancaItem[];
  ausencias?: ResponsavelAusenciaItem[];
  contrato?: ResponsavelContratoItem | null;
  responsaveis?: ResponsavelAdicionalItem[];
  rotas?: ResponsavelRotaItem[];
  responsavel_logado_id?: string | null;
}
