import { apiClient } from "./client";

export const assinaturaCobrancaApi = {
    getAssinaturaCobranca: (assinaturaCobrancaId: string) =>
        apiClient
            .get(`/assinatura-cobrancas/${assinaturaCobrancaId}`)
            .then(res => res.data),

    listAssinaturaCobrancas: (filtros?: Record<string, string>) =>
        apiClient
            .get(`/assinatura-cobrancas`, { params: filtros })
            .then(res => res.data),

    gerarPixParaCobranca: (cobrancaId: string) =>
        apiClient
            .post(`/assinatura-cobrancas/${cobrancaId}/gerar-pix`)
            .then(res => res.data),

    getCobrancaStatus: (cobrancaId: string) =>
        apiClient
            .get<{ status: string }>(`/assinatura-cobrancas/${cobrancaId}/status`)
            .then(res => res.data),
};
