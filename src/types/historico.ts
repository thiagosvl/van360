import { AtividadeAcao, AtividadeEntidadeTipo } from "./enums";

export interface AlteracaoAuditoria {
  campo: string;
  de: unknown;
  para: unknown;
}

export interface AtividadeMeta {
  valor?: number;
  campos?: string[];
  campos_alterados?: string[];
  alteracoes?: AlteracaoAuditoria[];
  motivo?: string;
  status?: string;
  ativo?: boolean;
  [key: string]: unknown;
}

export interface Atividade {
  id: string;
  usuario_id: string;
  entidade_id: string;
  entidade_tipo: AtividadeEntidadeTipo;
  acao: AtividadeAcao | string;
  descricao: string;
  meta: AtividadeMeta | null;
  ip_address: string | null;
  created_at: string;
}
