import { apiClient } from "./client";

const endpointBase = "/escolas";

export const escolaApi = {
  createEscola: (usuarioId: string, data: any) => {
    const payload = {
      ...data,
      ativo: true,
      usuario_id: usuarioId,
    }

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  listEscolas: (usuarioId: string, filtros?: Record<string, string>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  listEscolasComContagemAtivos: (usuarioId: string, filtros?: Record<string, any>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}/com-contagem`, { params: filtros })
      .then(res => res.data),

  deleteEscola: (escolaId: string) =>
    apiClient
      .delete(`${endpointBase}/${escolaId}`)
      .then(res => res.data),

  updateEscola: (escolaId: string, data: any) =>
    apiClient
      .put(`${endpointBase}/${escolaId}`, data)
      .then(res => res.data),
};
