import { GastoCategoria } from "./enums";

export interface Gasto {
  id: string;
  created_at: string;
  usuario_id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  notas?: string | null;
  veiculo_id?: string | null;
  veiculo?: {
    id: string;
    placa: string;
  } | null;
};

export const GASTO_CATEGORIA_LABELS: Record<GastoCategoria, string> = {
  [GastoCategoria.COMBUSTIVEL]: "Combustível",
  [GastoCategoria.MANUTENCAO]: "Manutenção",
  [GastoCategoria.IMPOSTOS]: "Impostos",
  [GastoCategoria.MULTAS]: "Multas",
  [GastoCategoria.LAVAGEM]: "Lavagem",
  [GastoCategoria.ALIMENTACAO]: "Alimentação",
  [GastoCategoria.SEGURO]: "Seguro",
  [GastoCategoria.OUTROS]: "Outros"
};

export const CATEGORIAS_GASTOS = Object.values(GastoCategoria);