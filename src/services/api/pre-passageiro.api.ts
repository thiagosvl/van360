import { PrePassageiro } from "@/types/prePassageiro";
import { apiClient } from "./client";

export const prePassageiroApi = {
  listPrePassageiros: (usuarioId: string, search?: string) =>
    apiClient
      .get<PrePassageiro[]>(`/pre-passageiros/usuario/${usuarioId}`, { params: { search } })
      .then(res => res.data),

  createPrePassageiro: (payload) =>
    apiClient
      .post(`/pre-passageiros`, payload)
      .then(res => res.data),

  deletePrePassageiro: (id: string) =>
    apiClient
      .delete(`/pre-passageiros/${id}`)
      .then(res => res.data),
};
