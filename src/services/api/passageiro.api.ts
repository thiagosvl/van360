import { apiClient } from "./client";

export const passageiroApi = {
  listPassageiros: (usuarioId: string, filtros?: Record<string, any>) =>
    apiClient
      .get(`/passageiros/usuario/${usuarioId}`, { params: filtros })
      .then(res => res.data),

  getContagemByUsuario: (usuarioId: string, filtros?: Record<string, string>) =>
    apiClient
      .get(`/passageiros/usuario/${usuarioId}/contagem`, { params: filtros })
      .then(res => res.data),

  getPassageiro: (passageiroId: string) =>
    apiClient
      .get(`/passageiros/${passageiroId}`)
      .then(res => res.data),

  deletePassageiro: (passageiroId: string) =>
    apiClient
      .delete(`/passageiros/${passageiroId}`)
      .then(res => res.data),

  getNumeroCobrancas: (passageiroId: string) =>
    apiClient
      .get(`/passageiros/${passageiroId}/numero-cobrancas`)
      .then(res => res.data.numeroCobrancas),

  toggleAtivo: (passageiroId: string, novoStatus: boolean) =>
    apiClient
      .patch(`/passageiros/${passageiroId}/toggle-ativo`, { novoStatus })
      .then(res => res.data),

  updatePassageiro: (passageiroId: string, data: any) =>
    apiClient
      .put(`/passageiros/${passageiroId}`, data)
      .then(res => res.data),

  createPassageiro: (data: any) =>
    apiClient
      .post(`/passageiros`, data)
      .then(res => res.data),

  finalizePreCadastro: (prePassageiroId: string, data: any, usuarioId: string, emitir_cobranca_mes_atual: boolean) =>
    apiClient
      .post(`/passageiros/finalize-pre-cadastro/${prePassageiroId}`, {
        data,
        usuarioId,
        emitir_cobranca_mes_atual,
      })
      .then(res => res.data),
};
