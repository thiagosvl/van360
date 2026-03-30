import { CreateCobrancaDTO, RegistrarPagamentoManualDTO, UpdateCobrancaDTO } from "@/types/dtos/cobranca.dto";
import { moneyToNumber } from "@/utils/masks";
import { apiClient } from "./client";

const endpointBase = "/cobrancas";

export const cobrancaApi = {
    createCobranca: (data: CreateCobrancaDTO) => {
        const payload = {
            ...data,
            valor: typeof data.valor === 'string' ? moneyToNumber(data.valor) : data.valor,
        };
        return apiClient.post(`${endpointBase}`, payload).then(res => res.data);
    },

    updateCobranca: (id: string, data: UpdateCobrancaDTO, cobrancaOriginal?: any) => {
        const cleanedData = {
            ...data,
            valor: data.valor !== undefined ? (typeof data.valor === 'string' ? moneyToNumber(data.valor) : data.valor) : undefined,
        };
        return apiClient.put(`${endpointBase}/${id}`, { data: cleanedData, cobrancaOriginal }).then(res => res.data);
    },

    deleteCobranca: (id: string) =>
        apiClient.delete(`${endpointBase}/${id}`).then(res => res.data),

    getCobranca: (id: string) =>
        apiClient.get(`${endpointBase}/${id}`).then(res => res.data),

    listCobrancasByPassageiro: (passageiroId: string, ano?: string) =>
        apiClient
            .get(`${endpointBase}/passageiro/${passageiroId}`, { params: { ano } })
            .then(res => res.data),

    listCobrancasWithFilters: (filtros: { mes?: string; ano?: string; passageiroId?: string; usuarioId?: string; status?: string; search?: string }) =>
        apiClient
            .get(`${endpointBase}`, { params: filtros })
            .then(res => res.data),

    countByPassageiro: (passageiroId: string) =>
        apiClient.get(`${endpointBase}/passageiro/${passageiroId}/count`).then(res => res.data.count),


    desfazerPagamento: (cobrancaId: string) =>
        apiClient.post(`${endpointBase}/${cobrancaId}/desfazer-pagamento-manual`).then(res => res.data),

    registrarPagamentoManual: (cobrancaId: string, data: RegistrarPagamentoManualDTO) => {
        const payload = {
            ...data,
            valor_pago: typeof data.valor_pago === 'string' ? moneyToNumber(data.valor_pago) : data.valor_pago,
        };
        return apiClient
            .post(`${endpointBase}/${cobrancaId}/registrar-pagamento-manual`, payload)
            .then(res => res.data);
    },



    fetchNotificacoesByCobrancaId: (cobrancaId: string) =>
        apiClient
            .get(`${endpointBase}/${cobrancaId}/notificacoes`)
            .then(res => res.data),

    toggleNotificacoes: (passageiroId: string, novoStatus: boolean) =>
        apiClient
            .patch(`${endpointBase}/${passageiroId}/toggle-notificacoes`, { novoStatus })
            .then(res => res.data),

};
