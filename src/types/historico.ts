import { AtividadeAcao, AtividadeEntidadeTipo } from "./enums";

export interface Atividade {
  id: string;
  usuario_id: string;
  entidade_id: string;
  entidade_tipo: AtividadeEntidadeTipo;
  acao: AtividadeAcao | string;
  descricao: string;
  meta: any;
  ip_address: string;
  created_at: string;
}
