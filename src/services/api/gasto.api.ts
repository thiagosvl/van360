import { toLocalDateString } from "@/utils/formatters";
import { moneyToNumber } from "@/utils/masks";
import { cleanString } from "@/utils/string";
import { apiClient } from "./client";

const endpointBase = "/gastos";

export const gastoApi = {
  createGasto: (usuarioId: string, data: any) => {
    const payload = {
      usuario_id: usuarioId,
      valor: moneyToNumber(data.valor),
      data: toLocalDateString(data.data),
      descricao: cleanString(data.descricao),
      categoria: data.categoria,
      veiculo_id: data.veiculo_id,
    }

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  listGastos: (usuarioId: string, filtros?: Record<string, string | undefined>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  deleteGasto: (gastoId: string) =>
    apiClient
      .delete(`${endpointBase}/${gastoId}`)
      .then(res => res.data),

  updateGasto: (gastoId: string, data: any) => {
    const payload = {
      usuario_id: data.usuario_id,
      valor: moneyToNumber(data.valor),
      data: toLocalDateString(data.data),
      descricao: cleanString(data.descricao),
      categoria: data.categoria,
      veiculo_id: data.veiculo_id,
    }


    return apiClient
      .put(`${endpointBase}/${gastoId}`, payload)
      .then(res => res.data);
  }
};
