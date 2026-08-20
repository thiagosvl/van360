import {
  ContratoProvider,
  ContratoStatus,
  ParentescoResponsavel,
  PassageiroGenero,
  PassageiroModalidade,
  PassageiroPeriodo,
  TipoResponsavel,
} from "./enums";

export interface Responsavel {
  id?: string;
  responsavel_id?: string;
  telefone: string;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  parentesco?: ParentescoResponsavel;
  pin_acesso?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  referencia?: string | null;
  complemento?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Passageiro {
  id?: string;
  nome: string;
  periodo: PassageiroPeriodo;

  responsavel_principal?: Responsavel;
  valor_cobranca: number;
  dia_vencimento: number;
  created_at?: string;
  updated_at?: string;
  escola_id?: string;
  veiculo_id: string;
  usuario_id?: string;
  ativo?: boolean;
  isento?: boolean;
  enviar_notificacoes?: boolean;
  observacoes?: string;
  escola?: { id?: string; nome?: string };
  escola_nome?: string;
  veiculo?: { id?: string; placa?: string; modelo?: string };

  status_contrato?: ContratoStatus;
  contrato_id?: string;
  contrato_url?: string;
  contrato_status?: string;
  contrato_provider?: ContratoProvider;
  minuta_url?: string;
  contrato_final_url?: string;
  token_acesso?: string;

  // Campos Tipados com Enums
  modalidade?: PassageiroModalidade;
  data_nascimento?: string;
  genero?: PassageiroGenero;
  data_inicio_transporte?: string;
  turma?: string;
  nome_professor?: string;
  data_fim_transporte?: string;
  data_inicio_cobranca?: string;
  data_fim_cobranca?: string;
  responsaveis?: PassageiroResponsavel[];
  responsavel_logado_id?: string | null;
}

export interface PassageiroResponsavel {
  id?: string;
  passageiro_id?: string;
  responsavel_id?: string;
  nome: string;
  telefone: string;
  cpf?: string | null;
  email?: string | null;
  parentesco?: ParentescoResponsavel;
  tipo?: TipoResponsavel;
  pin_acesso?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  referencia?: string | null;
  complemento?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Aniversariante {
  id: string;
  nome: string;
  dia: number;
  veiculo?: { id: string; placa: string; modelo?: string };
  escola?: { id: string; nome: string };
  ativo?: boolean;
}

export interface SemanaAniversario {
  semana: number;
  aniversariantes: Aniversariante[];
}

export interface AniversariantesResponse {
  semanas: SemanaAniversario[];
  passageirosSemData: number;
  passageirosSemDataList?: Omit<Aniversariante, "dia">[];
}