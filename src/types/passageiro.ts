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
  email_responsavel: string;
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

  // Campos Tipados com Enums
  modalidade?: PassageiroModalidade;
  data_nascimento?: string;
  genero?: PassageiroGenero;
  parentesco_responsavel?: ParentescoResponsavel;
  data_inicio_transporte?: string;
}