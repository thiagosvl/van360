export interface PrePassageiro {
    id: string;
    usuario_id: string;
    created_at: string;
    updated_at: string;

    nome: string;
    nome_responsavel: string;

    cpf_responsavel: string;
    telefone_responsavel: string;
    email_responsavel?: string | null;
    periodo: string;

    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    referencia: string | null;
    complemento?: string | null;
    observacoes: string | null;

    escola_id: string | null;
    veiculo_id: string | null;
    valor_cobranca: number | null;
    dia_vencimento: number | null;
    
    modalidade?: string;
    data_nascimento?: string;
    genero?: string;
    parentesco_responsavel?: string;
    data_inicio_transporte?: string;
    turma?: string;
    nome_professor?: string;
    data_fim_transporte?: string;
    data_inicio_cobranca?: string;
    data_fim_cobranca?: string;
}
