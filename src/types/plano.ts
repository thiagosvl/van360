export interface SubPlano {
  id: string;
  nome: string;
  preco: number;
  preco_promocional?: number;
  promocao_ativa: boolean;
  promocuia_cobrancas_mes?: number;
  franquia_cobrancas_mes: number;
  parent_id?: string;
}

export interface Plano {
  id: string;
  nome: string;
  slug: string;
  descricao_curta: string;
  preco: number;
  preco_promocional?: number;
  promocao_ativa: boolean;
  beneficios: string[];
  tipo: "base" | "sub";
  parent_id?: string;
  limite_passageiros: string;
  permite_cobrancas: boolean;
  trial_days: number;
}

