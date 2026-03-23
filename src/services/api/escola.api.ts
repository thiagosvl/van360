import { Escola } from "@/types/escola";
import { apiClient } from "./client";

const endpointBase = "/escolas";

export const escolaApi = {
  createEscola: (usuarioId: string, data: any): Promise<Escola> => {
    const payload = {
      ...data,
      ativo: true,
      usuario_id: usuarioId,
    }

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  listEscolas: (usuarioId: string, filtros?: Record<string, string>): Promise<Escola[]> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  listEscolasComContagemAtivos: (usuarioId: string, filtros?: Record<string, any>): Promise<(Escola & { passageiros_ativos_count?: number })[]> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}/com-contagem`, { params: filtros })
      .then(res => res.data),

  deleteEscola: (escolaId: string): Promise<void> =>
    apiClient
      .delete(`${endpointBase}/${escolaId}`)
      .then(res => res.data),

  updateEscola: (escolaId: string, data: any): Promise<Escola> =>
    apiClient
      .put(`${endpointBase}/${escolaId}`, data)
      .then(res => res.data),
};
