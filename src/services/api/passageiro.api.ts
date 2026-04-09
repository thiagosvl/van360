import { Passageiro } from "@/types/passageiro";
import { moneyToNumber } from "@/utils/masks";
import { cleanString } from "@/utils/string";
import { apiClient } from "./client";

const endpointBase = "/passageiros";

export const passageiroApi = {
  listPassageiros: (usuarioId: string, filtros?: Record<string, any>): Promise<Passageiro[]> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

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

  updatePassageiro: (passageiroId: string, data: any): Promise<Passageiro> => {
    const payload: any = { ...data };

    if (data.valor_cobranca !== undefined) payload.valor_cobranca = moneyToNumber(data.valor_cobranca);
    if (data.nome !== undefined) payload.nome = cleanString(data.nome);
    if (data.nome_responsavel !== undefined) payload.nome_responsavel = cleanString(data.nome_responsavel);
    if (data.email_responsavel !== undefined) payload.email_responsavel = cleanString(data.email_responsavel);
    if (data.endereco !== undefined) payload.endereco = cleanString(data.endereco);
    if (data.bairro !== undefined) payload.bairro = cleanString(data.bairro);
    if (data.complemento !== undefined) payload.complemento = cleanString(data.complemento);
    if (data.observacoes !== undefined) payload.observacoes = cleanString(data.observacoes) || null;
    if (data.repasse_taxa_servico !== undefined) payload.repasse_taxa_servico = data.repasse_taxa_servico;

    return apiClient
      .put(`${endpointBase}/${passageiroId}`, payload)
      .then(res => res.data);
  },

  createPassageiro: (data: any): Promise<Passageiro> => {
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
      repasse_taxa_servico: data.repasse_taxa_servico ?? false,
    };

    return apiClient
      .post(`${endpointBase}`, payload)
      .then(res => res.data);
  },

  finalizePreCadastro: (prePassageiroId: string, data: any, usuarioId: string): Promise<{ success: boolean; passageiro: Passageiro }> => {
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
      repasse_taxa_servico: data.repasse_taxa_servico ?? false,
    };

    return apiClient
      .post(`${endpointBase}/finalizar-pre-cadastro/${prePassageiroId}`, {
        data: payload,
        usuarioId,
      })
      .then(res => res.data);
  },
};
