import { apiClient } from "./client";

export const planoApi = {
    getPlanos: (filtros?: Record<string, string>) =>
        apiClient
            .get(`/planos`, { params: filtros })
            .then(res => res.data),

    listAssinaturaCobrancas: (filtros?: Record<string, string>) =>
        apiClient
            .get(`/assinatura-cobrancas`, { params: filtros })
            .then(res => res.data),

    /**
     * Calcula o preço preview para quantidade personalizada do Plano Completo
     * @param quantidade - Quantidade de cobranças desejada
     * @param ignorarMinimo - Se true, ignora o mínimo do plano e calcula proporcional
     * @returns Objeto com preco, valorPorCobranca ou null se a quantidade for inválida
     */
    calcularPrecoPreview: async (quantidade: number, ignorarMinimo: boolean = false): Promise<{
        preco: number;
        valorPorCobranca: number;
    } | null> => {
        try {
            const response = await apiClient.post(
                `/planos/calcular-preco-preview`,
                { quantidade, ignorarMinimo }
            );
            // Se preco for null, retorna null (quantidade inválida)
            if (response.data.preco === null) {
                return null;
            }
            return {
                preco: response.data.preco,
                valorPorCobranca: response.data.valorPorCobranca,
            };
        } catch (error: any) {
            // Se for erro de validação, retorna null (quantidade inválida)
            if (error?.response?.status === 400) {
                return null;
            }
            throw error;
        }
    },
};
