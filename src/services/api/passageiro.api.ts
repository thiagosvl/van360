import { moneyToNumber } from "@/utils/masks";
import { cleanString } from "@/utils/string";
import { apiClient } from "./client";

const endpointBase = "/passageiros";

export const passageiroApi = {
  listPassageiros: (usuarioId: string, filtros?: Record<string, any>) =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  getPassageiro: (passageiroId: string) =>
    apiClient
      .get(`${endpointBase}/${passageiroId}`)
      .then(res => res.data),

  deletePassageiro: (passageiroId: string) =>
    apiClient
      .delete(`${endpointBase}/${passageiroId}`)
      .then(res => res.data),

  getNumeroCobrancas: (passageiroId: string) =>
    apiClient
      .get(`${endpointBase}/${passageiroId}/numero-cobrancas`)
      .then(res => res.data.numeroCobrancas),

  toggleAtivo: (passageiroId: string, novoStatus: boolean) =>
    apiClient
      .patch(`${endpointBase}/${passageiroId}/toggle-ativo`, { novoStatus })
      .then(res => res.data),

  updatePassageiro: (passageiroId: string, data: any) => {
    const payload = {
      ...data,
      valor_cobranca: moneyToNumber(data.valor_cobranca),
      nome: cleanString(data.nome),
      nome_responsavel: cleanString(data.nome_responsavel),
      email_responsavel: cleanString(data.email_responsavel),
      endereco: cleanString(data.endereco),
      bairro: cleanString(data.bairro),
      complemento: cleanString(data.complemento),
      observacoes: cleanString(data.observacoes),
    };

    return apiClient
      .put(`${endpointBase}/${passageiroId}`, payload)
      .then(res => res.data);
  },

  createPassageiro: (data: any) => {
    const payload = {
      ...data,
      valor_cobranca: moneyToNumber(data.valor_cobranca),
      nome: cleanString(data.nome),
      nome_responsavel: cleanString(data.nome_responsavel),
      email_responsavel: cleanString(data.email_responsavel),
      endereco: cleanString(data.endereco),
      bairro: cleanString(data.bairro),
      complemento: cleanString(data.complemento),
      observacoes: cleanString(data.observacoes),
    };

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  finalizePreCadastro: (prePassageiroId: string, data: any, usuarioId: string) => {
    const payload = {
      ...data,
      valor_cobranca: moneyToNumber(data.valor_cobranca),
      nome: cleanString(data.nome),
      nome_responsavel: cleanString(data.nome_responsavel),
      email_responsavel: cleanString(data.email_responsavel),
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
};
