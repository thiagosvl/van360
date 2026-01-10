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
  emitir_cobranca_mes_atual?: boolean;
  enviar_cobranca_automatica?: boolean;
}