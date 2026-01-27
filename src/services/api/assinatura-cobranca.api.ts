import { apiClient } from "./client";

const endpointBase = "/assinatura-cobrancas";

export const assinaturaCobrancaApi = {
    getAssinaturaCobranca: (assinaturaCobrancaId: string) =>
        apiClient
            .get(`${endpointBase}/${assinaturaCobrancaId}`)
            .then(res => res.data),

    listAssinaturaCobrancas: (filtros?: Record<string, string>) =>
        apiClient
            .get(`${endpointBase}`, { params: filtros })
            .then(res => res.data),

    gerarPixParaCobranca: (cobrancaId: string) =>
        apiClient
            .post(`${endpointBase}/${cobrancaId}/gerar-pix`)
            .then(res => res.data),

    getCobrancaStatus: (cobrancaId: string) =>
        apiClient
            .get<{ status: string }>(`${endpointBase}/${cobrancaId}/status`)
            .then(res => res.data),
};
