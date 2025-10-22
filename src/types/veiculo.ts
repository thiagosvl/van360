export interface Veiculo {
    id: string;
    usuario_id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano_fabricacao?: string;
    ano_modelo?: string;
    capacidade?: number;
    ativo: boolean;
    created_at?: string;
    updated_at?: string;
}
