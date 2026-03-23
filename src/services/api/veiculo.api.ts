import { Veiculo } from "@/types/veiculo";
import { apiClient } from "./client";

const endpointBase = "/veiculos";

export const veiculoApi = {
  createVeiculo: (usuarioId: string, data: any): Promise<Veiculo> => {
    const payload = {
      ...data,
      ativo: true,
      usuario_id: usuarioId,
    }

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  listVeiculos: (usuarioId: string, filtros?: Record<string, string>): Promise<Veiculo[]> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  listVeiculosComContagemAtivos: (usuarioId: string, filtros?: Record<string, any>): Promise<(Veiculo & { passageiros_ativos_count?: number })[]> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}/com-contagem`, { params: filtros })
      .then(res => res.data),

  deleteVeiculo: (veiculoId: string): Promise<void> =>
    apiClient
      .delete(`${endpointBase}/${veiculoId}`)
      .then(res => res.data),

  updateVeiculo: (veiculoId: string, data: any): Promise<Veiculo> =>
    apiClient
      .put(`${endpointBase}/${veiculoId}`, data)
      .then(res => res.data),
};
