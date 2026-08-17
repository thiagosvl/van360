import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { moneyToNumber } from "@/utils/masks";
import { cleanString } from "@/utils/string";
import { apiClient } from "./client";

const endpointBase = "/passageiros";

export interface ListPassageirosResponse {
  list: Passageiro[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export const passageiroApi = {
  listPassageiros: (usuarioId: string, filtros?: Record<string, unknown>): Promise<ListPassageirosResponse> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => {
        if (Array.isArray(res.data)) {
          return { list: res.data, total: res.data.length };
        }
        return res.data;
      }),

  getPassageiro: (passageiroId: string): Promise<Passageiro> =>
    apiClient
      .get(`${endpointBase}/${passageiroId}`)
      .then(res => res.data),

  deletePassageiro: (passageiroId: string): Promise<void> =>
    apiClient
      .delete(`${endpointBase}/${passageiroId}`)
      .then(res => res.data),

  toggleAtivo: (passageiroId: string, novoStatus: boolean): Promise<Passageiro> =>
    apiClient
      .patch(`${endpointBase}/${passageiroId}/toggle-ativo`, { novoStatus })
      .then(res => res.data),

  updatePassageiro: (passageiroId: string, data: Record<string, unknown>): Promise<Passageiro> => {
    const payload: Record<string, unknown> = { ...data };

    if (data.valor_cobranca !== undefined) payload.valor_cobranca = moneyToNumber(data.valor_cobranca as string);
    if (data.nome !== undefined) payload.nome = cleanString(data.nome);

    if (data.endereco !== undefined) payload.endereco = cleanString(data.endereco);
    if (data.bairro !== undefined) payload.bairro = cleanString(data.bairro);
    if (data.complemento !== undefined) payload.complemento = cleanString(data.complemento);
    if (data.observacoes !== undefined) payload.observacoes = cleanString(data.observacoes) || null;

    return apiClient
      .put(`${endpointBase}/${passageiroId}`, payload)
      .then(res => res.data);
  },

  createPassageiro: (data: Record<string, unknown>): Promise<Passageiro> => {
    const payload = {
      ...data,
      valor_cobranca: moneyToNumber(data.valor_cobranca as string),
      nome: cleanString(data.nome),

      endereco: cleanString(data.endereco),
      bairro: cleanString(data.bairro),
      complemento: cleanString(data.complemento),
      observacoes: cleanString(data.observacoes),
    };

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  finalizePreCadastro: (prePassageiroId: string, data: Record<string, unknown>, usuarioId: string): Promise<{ success: boolean; passageiro: Passageiro }> => {
    const payload = {
      ...data,
      valor_cobranca: moneyToNumber(data.valor_cobranca as string),
      nome: cleanString(data.nome),

      endereco: cleanString(data.endereco),
      bairro: cleanString(data.bairro),
      complemento: cleanString(data.complemento),
      observacoes: cleanString(data.observacoes),
    };

    return apiClient
      .post(`${endpointBase}/finalizar-pre-cadastro/${prePassageiroId}`, {
        data: payload,
        usuarioId,
      })
      .then(res => res.data);
  },

  getAniversariantes: (mes: number): Promise<Passageiro[]> =>
    apiClient
      .get(`${endpointBase}/aniversariantes`, { params: { mes } })
      .then(res => res.data),

  addResponsavelAdicional: (passageiroId: string, data: Record<string, unknown>): Promise<PassageiroResponsavel> =>
    apiClient
      .post(`${endpointBase}/${passageiroId}/responsaveis`, data)
      .then(res => res.data),

  updateResponsavelAdicional: (
    responsavelId: string,
    data: Record<string, unknown>,
    passageiroId?: string
  ): Promise<PassageiroResponsavel> =>
    apiClient
      .put(`${endpointBase}/responsaveis/${responsavelId}`, { ...data, passageiroId: passageiroId || data.passageiroId })
      .then(res => res.data),

  deleteResponsavelAdicional: (responsavelId: string): Promise<void> =>
    apiClient
      .delete(`${endpointBase}/responsaveis/${responsavelId}`)
      .then(res => res.data),

  setPrincipalResponsavel: (passageiroId: string, responsavelId: string): Promise<void> =>
    apiClient
      .patch(`${endpointBase}/${passageiroId}/responsaveis/${responsavelId}/set-principal`)
      .then(res => res.data),
};
