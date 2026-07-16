import {
    ContratoStatus,
    ParentescoResponsavel,
    PassageiroGenero,
    PassageiroModalidade,
    PassageiroPeriodo,
} from "./enums";

export interface Passageiro {
  id?: string;
  nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  periodo: PassageiroPeriodo;
  nome_responsavel: string;

  telefone_responsavel: string;
  cpf_responsavel: string;
  valor_cobranca: number;
  dia_vencimento: number;
  created_at?: string;
  updated_at?: string;
  escola_id?: string;
  veiculo_id: string;
  usuario_id?: string;
  ativo?: boolean;
  enviar_notificacoes?: boolean;
  referencia?: string;
  observacoes?: string;
  escola?: { nome: string };
  veiculo?: { placa: string };

  status_contrato?: ContratoStatus;
  contrato_id?: string;
  contrato_url?: string;
  contrato_status?: string;
  minuta_url?: string;
  contrato_final_url?: string;
  token_acesso?: string;

  // Campos Tipados com Enums
  modalidade?: PassageiroModalidade;
  data_nascimento?: string;
  genero?: PassageiroGenero;
  parentesco_responsavel?: ParentescoResponsavel;
  data_inicio_transporte?: string;
  turma?: string;
  data_fim_transporte?: string;
  data_inicio_cobranca?: string;
  data_fim_cobranca?: string;
  responsaveis?: PassageiroResponsavel[];
}

export interface PassageiroResponsavel {
  id?: string;
  passageiro_id: string;
  nome: string;
  telefone: string;
  cpf: string;
  parentesco: ParentescoResponsavel;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  referencia?: string;
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