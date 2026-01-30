import { ContratoStatus } from "./enums";

export interface Passageiro {
  id?: string;
  nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  periodo: string;
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

  enviar_cobranca_automatica?: boolean;
  status_contrato?: ContratoStatus;
  contrato_id?: string;
  contrato_url?: string;
  minuta_url?: string;
  contrato_final_url?: string;

  // Novos Campos
  modalidade?: string;
  data_nascimento?: string;
  genero?: string;
  parentesco_responsavel?: string;
  data_inicio_transporte?: string;
}