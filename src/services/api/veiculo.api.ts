import { apiClient } from "./client";

const endpointBase = "/veiculos";

export const veiculoApi = {
  createVeiculo: (usuarioId: string, data: any) => {
    const payload = {
      ...data,
      ativo: true,
      usuario_id: usuarioId,
    }

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  listVeiculos: (usuarioId: string, filtros?: Record<string, string>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  listVeiculosComContagemAtivos: (usuarioId: string, filtros?: Record<string, any>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}/com-contagem`, { params: filtros })
      .then(res => res.data),

  deleteVeiculo: (veiculoId: string) =>
    apiClient
      .delete(`${endpointBase}/${veiculoId}`)
      .then(res => res.data),

  updateVeiculo: (veiculoId: string, data: any) =>
    apiClient
      .put(`${endpointBase}/${veiculoId}`, data)
      .then(res => res.data),
};
