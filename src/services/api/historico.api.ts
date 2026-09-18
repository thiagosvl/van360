import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { apiClient } from "./client";

const endpointBase = "/historico";

export interface RegistrarEventoDTO {
  acao: AtividadeAcao;
  entidade_tipo?: AtividadeEntidadeTipo;
  entidade_id?: string;
  descricao?: string;
  meta?: Record<string, unknown>;
}

export const historicoApi = {
  listByEntidade: (entidadeTipo: AtividadeEntidadeTipo | string, entidadeId: string) =>
    apiClient.get(`${endpointBase}/entidade/${entidadeTipo}/${entidadeId}`).then(res => res.data),

  listByUsuario: (usuarioId: string) =>
    apiClient.get(`${endpointBase}/usuario/${usuarioId}`).then(res => res.data),

  registrarEvento: (payload: RegistrarEventoDTO) =>
    apiClient.post(`${endpointBase}/evento`, payload),
};
