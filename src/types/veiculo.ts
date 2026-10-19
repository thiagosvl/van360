export interface Veiculo {
    id: string;
    usuario_id: string;
    placa: string;
    marca: string;
    modelo: string;
    ativo: boolean;
    chave_pix?: string | null;
    tipo_chave_pix?: string | null;
    created_at?: string;
    updated_at?: string;
    passageiros_ativos_count?: number;
}
