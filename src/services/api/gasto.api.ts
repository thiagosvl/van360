import { toLocalDateString } from "@/utils/formatters";
import { cleanString } from "@/utils/string";
import { moneyToNumber } from "@/utils/masks";
import { apiClient } from "./client";

export const gastoApi = {
  createGasto: (usuarioId: string, data: any) => {
    const payload = {
      usuario_id: usuarioId,
      valor: moneyToNumber(data.valor),
      data: toLocalDateString(data.data),
      descricao: cleanString(data.descricao, true),
      categoria: data.categoria,
    }

    return apiClient
      .post(`/gastos`, payload)
      .then(res => res.data);
  },

  listGastos: (usuarioId: string, filtros?: Record<string, string>) =>
    apiClient
      .get(`/gastos/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  deleteGasto: (gastoId: string) =>
    apiClient
      .delete(`/gastos/${gastoId}`)
      .then(res => res.data),

  updateGasto: (gastoId: string, data: any) => {
    const payload = {
      usuario_id: data.usuario_id,
      valor: moneyToNumber(data.valor),
      data: toLocalDateString(data.data),
      descricao: cleanString(data.descricao, true),
      categoria: data.categoria,
    }

    return apiClient
      .put(`/gastos/${gastoId}`, payload)
      .then(res => res.data);
  }
};
