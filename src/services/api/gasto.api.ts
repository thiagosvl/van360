import { toLocalDateString } from "@/utils/formatters";
import { moneyToNumber } from "@/utils/masks";
import { cleanString } from "@/utils/string";
import { apiClient } from "./client";
import { GastoEscopoAcao } from "@/types/enums";
import type { Gasto } from "@/types/gasto";

const endpointBase = "/gastos";

export interface CreateGastoPayload extends Partial<Gasto> {
  parcelado?: boolean;
  parcelas?: number;
  tipo_calculo_parcela?: string;
  escopo?: GastoEscopoAcao;
}

export const gastoApi = {
  createGasto: (usuarioId: string, data: CreateGastoPayload) => {
    const payload = {
      usuario_id: usuarioId,
      valor: typeof data.valor === "number" ? data.valor : moneyToNumber(String(data.valor || 0)),
      data: data.data ? toLocalDateString(data.data) : undefined,
      descricao: data.descricao ? cleanString(data.descricao) : undefined,
      categoria: data.categoria,
      veiculo_id: data.veiculo_id,
      fretamento_id: data.fretamento_id,
      parcelado: data.parcelado || false,
      parcelas: data.parcelas || undefined,
      tipo_calculo_parcela: data.tipo_calculo_parcela || undefined,
    };

    return apiClient
      .post(`${endpointBase}`, payload)
      .then((res) => res.data);
  },

  listGastos: (usuarioId: string, filtros?: Record<string, string | undefined>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then((res) => res.data),

  deleteGasto: (gastoId: string, escopo?: GastoEscopoAcao) =>
    apiClient
      .delete(`${endpointBase}/${gastoId}`, { params: { escopo } })
      .then((res) => res.data),

  updateGasto: (gastoId: string, data: CreateGastoPayload, escopo?: GastoEscopoAcao) => {
    const payload = {
      usuario_id: data.usuario_id,
      valor: typeof data.valor === "number" ? data.valor : moneyToNumber(String(data.valor || 0)),
      data: data.data ? toLocalDateString(data.data) : undefined,
      descricao: data.descricao ? cleanString(data.descricao) : undefined,
      categoria: data.categoria,
      veiculo_id: data.veiculo_id,
      fretamento_id: data.fretamento_id,
      escopo: escopo || data.escopo || undefined,
    };

    return apiClient
      .put(`${endpointBase}/${gastoId}`, payload)
      .then((res) => res.data);
  },
};
