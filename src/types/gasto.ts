
export interface Gasto {
  id: string;
  created_at: string;
  usuario_id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  notas?: string | null;
};