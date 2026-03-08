import { AtividadeEntidadeTipo } from "@/types/enums";
import { apiClient } from "./client";

const endpointBase = "/historico";

export const historicoApi = {
  listByEntidade: (entidadeTipo: AtividadeEntidadeTipo | string, entidadeId: string) =>
    apiClient.get(`${endpointBase}/entidade/${entidadeTipo}/${entidadeId}`).then(res => res.data),

  listByUsuario: (usuarioId: string) =>
    apiClient.get(`${endpointBase}/usuario/${usuarioId}`).then(res => res.data),
};
