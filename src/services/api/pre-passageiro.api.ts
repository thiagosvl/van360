import { PrePassageiro } from "@/types/prePassageiro";
import { moneyToNumber } from "@/utils/masks";
import { apiClient } from "./client";

const endpointBase = "/pre-passageiros";

export const prePassageiroApi = {
  listPrePassageiros: (usuarioId: string, search?: string) =>
    apiClient
      .get<PrePassageiro[]>(`${endpointBase}/usuario/${usuarioId}`, { params: { search } })
      .then(res => res.data),

  createPrePassageiro: (payload: any) => {
    const cleanedPayload = {
      ...payload,
      valor_cobranca: moneyToNumber(payload.valor_cobranca),
    };
    return apiClient
      .post(`${endpointBase}`, cleanedPayload)
      .then(res => res.data);
  },

  deletePrePassageiro: (id: string) =>
    apiClient
      .delete(`${endpointBase}/${id}`)
      .then(res => res.data),
};
