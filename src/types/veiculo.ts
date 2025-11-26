export interface Veiculo {
    id: string;
    usuario_id: string;
    placa: string;
    marca: string;
    modelo: string;
    ativo: boolean;
    created_at?: string;
    updated_at?: string;
    passageiros_ativos_count?: number;
    ano_modelo?: string;
}
