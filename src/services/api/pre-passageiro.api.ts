import { PrePassageiro } from "@/types/prePassageiro";
import { moneyToNumber } from "@/utils/masks";
import { apiClient } from "./client";

export const prePassageiroApi = {
  listPrePassageiros: (usuarioId: string, search?: string) =>
    apiClient
      .get<PrePassageiro[]>(`/pre-passageiros/usuario/${usuarioId}`, { params: { search } })
      .then(res => res.data),

  createPrePassageiro: (payload: any) => {
    const cleanedPayload = {
      ...payload,
      valor_cobranca: moneyToNumber(payload.valor_cobranca),
    };
    return apiClient
      .post(`/pre-passageiros`, cleanedPayload)
      .then(res => res.data);
  },

  deletePrePassageiro: (id: string) =>
    apiClient
      .delete(`/pre-passageiros/${id}`)
      .then(res => res.data),
};
