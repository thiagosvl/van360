export interface PrePassageiro {
    id: string;
    usuario_id: string;
    created_at: string;
    updated_at: string;

    nome: string;
    nome_responsavel: string;
    email_responsavel: string;
    cpf_responsavel: string;
    telefone_responsavel: string;
    periodo: string;

    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    referencia: string | null;
    observacoes: string | null;

    escola_id: string | null;
    veiculo_id: string | null;
    valor_cobranca: number | null;
    dia_vencimento: number | null;
    
    // Novos Campos
    modalidade?: string;
    data_nascimento?: string;
    genero?: string;
    parentesco_responsavel?: string;
    data_inicio_transporte?: string;
}
