import { CobrancaStatus } from "@/types/enums";
import { moneyToNumber } from "@/utils/masks";
import { apiClient } from "./client";

const endpointBase = "/cobrancas";

export const cobrancaApi = {
    createCobranca: (data: any) => {
        const payload = {
            ...data,
            valor: moneyToNumber(data.valor),
        };
        return apiClient.post(`${endpointBase}`, payload).then(res => res.data);
    },

    updateCobranca: (id: string, data: any, cobrancaOriginal?: any) => {
        const cleanedData = {
            ...data,
            valor: data.valor !== undefined ? moneyToNumber(data.valor) : undefined,
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

    registrarPagamentoManual: (cobrancaId: string, data: any) => {
        return cobrancaApi.updateCobranca(cobrancaId, {
            status: CobrancaStatus.PAGO,
            data_pagamento: data.data_pagamento,
            tipo_pagamento: data.tipo_pagamento,
            valor_pago: moneyToNumber(data.valor_pago),
            pagamento_manual: true,
        });
    },

    fetchAvailableYears: (passageiroId: string) =>
        apiClient
            .get(`${endpointBase}/passageiro/${passageiroId}/anos-disponiveis`)
            .then(res => res.data),

    fetchNotificacoesByCobrancaId: (cobrancaId: string) =>
        apiClient
            .get(`${endpointBase}/${cobrancaId}/notificacoes`)
            .then(res => res.data),

    enviarNotificacaoByCobrancaId: (cobrancaId: string) => {
        const payload = {
            cobranca_id: cobrancaId,
            tipo_origem: 'manual',
            tipo_evento: 'COBRANCA_MANUAL',
            canal: 'whatsapp',
        };

        return apiClient
            .post(`${endpointBase}/${cobrancaId}/notificacoes`, payload)
            .then(res => res.data);
    },

    toggleNotificacoes: (passageiroId: string, novoStatus: boolean) =>
        apiClient
            .patch(`${endpointBase}/${passageiroId}/toggle-notificacoes`, { novoStatus })
            .then(res => res.data),

};
