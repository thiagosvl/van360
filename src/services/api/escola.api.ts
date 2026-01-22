import { apiClient } from "./client";

export const escolaApi = {
  createEscola: (usuarioId: string, data: any) => {
    const payload = {
      ...data,
      ativo: true,
      usuario_id: usuarioId,
    }

    return apiClient
      .post(`/escolas`, payload)
      .then(res => res.data);
  },

  listEscolas: (usuarioId: string, filtros?: Record<string, string>) =>
    apiClient
      .get(`/escolas/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  listEscolasComContagemAtivos: (usuarioId: string, filtros?: Record<string, any>) =>
    apiClient
      .get(`/escolas/usuario/${usuarioId}/com-contagem`, { params: filtros })
      .then(res => res.data),

  deleteEscola: (escolaId: string) =>
    apiClient
      .delete(`/escolas/${escolaId}`)
      .then(res => res.data),

  updateEscola: (escolaId: string, data: any) =>
    apiClient
      .put(`/escolas/${escolaId}`, data)
      .then(res => res.data),
};
