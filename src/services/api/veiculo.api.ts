import { apiClient } from "./client";

export const veiculoApi = {
  createVeiculo: (usuarioId: string, data: any) => {
    const payload = {
      ...data,
      ativo: true,
      usuario_id: usuarioId,
    }

    return apiClient
      .post(`/veiculos`, payload)
      .then(res => res.data);
  },

  listVeiculos: (usuarioId: string, filtros?: Record<string, string>) =>
    apiClient
      .get(`/veiculos/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  listVeiculosComContagemAtivos: (usuarioId: string, filtros?: Record<string, any>) =>
    apiClient
      .get(`/veiculos/usuario/${usuarioId}/com-contagem`, { params: filtros })
      .then(res => res.data),

  deleteVeiculo: (veiculoId: string) =>
    apiClient
      .delete(`/veiculos/${veiculoId}`)
      .then(res => res.data),

  updateVeiculo: (veiculoId: string, data: any) =>
    apiClient
      .put(`/veiculos/${veiculoId}`, data)
      .then(res => res.data),
};
