import { apiClient } from "./client";

const endpointBase = "/planos";

export const planoApi = {
    getPlanos: (filtros?: Record<string, string>) =>
        apiClient
            .get(`${endpointBase}`, { params: filtros })
            .then(res => res.data),

    listAssinaturaCobrancas: (filtros?: Record<string, string>) =>
        apiClient
            .get(`${endpointBase}/assinatura-cobrancas`, { params: filtros })
            .then(res => res.data),

    calcularPrecoPreview: async (quantidade: number, ignorarMinimo: boolean = false): Promise<{
        preco: number;
        valorPorCobranca: number;
    } | null> => {
        try {
            const response = await apiClient.post(
                `${endpointBase}/calcular-preco-preview`,
                { quantidade, ignorarMinimo }
            );
            if (response.data.preco === null) {
                return null;
            }
            return {
                preco: response.data.preco,
                valorPorCobranca: response.data.valorPorCobranca,
            };
        } catch (error: any) {
            if (error?.response?.status === 400) {
                return null;
            }
            throw error;
        }
    },
};
