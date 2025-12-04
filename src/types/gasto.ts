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

export const CATEGORIAS_GASTOS = [
  "Salário",
  "Combustível",
  "Manutenção",
  "Vistorias",
  "Documentação",
  "Administrativa",
  "Outro",
];