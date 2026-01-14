import { CobrancaStatus } from "@/types/enums";
import { apiClient } from "./client";

export const cobrancaApi = {
    createCobranca: (data: any) =>
        apiClient.post(`/cobrancas`, data).then(res => res.data),

    updateCobranca: (id: string, data: any, cobrancaOriginal?: any) =>
        apiClient.put(`/cobrancas/${id}`, { data, cobrancaOriginal }).then(res => res.data),

    deleteCobranca: (id: string) =>
        apiClient.delete(`/cobrancas/${id}`).then(res => res.data),

    getCobranca: (id: string) =>
        apiClient.get(`/cobrancas/${id}`).then(res => res.data),

    listCobrancasByPassageiro: (passageiroId: string, ano?: string) =>
        apiClient
            .get(`/cobrancas/passageiro/${passageiroId}`, { params: { ano } })
            .then(res => res.data),

    listCobrancasWithFilters: (filtros: { mes?: string; ano?: string; passageiroId?: string; usuarioId?: string; status?: string }) =>
        apiClient
            .get(`/cobrancas`, { params: filtros })
            .then(res => res.data),

    countByPassageiro: (passageiroId: string) =>
        apiClient.get(`/cobrancas/passageiro/${passageiroId}/count`).then(res => res.data.count),


    desfazerPagamento: (cobrancaId: string) =>
        apiClient.post(`/cobrancas/${cobrancaId}/desfazer-pagamento`).then(res => res.data),

    registrarPagamentoManual: (cobrancaId: string, data) => {
        return cobrancaApi.updateCobranca(cobrancaId, {
            status: CobrancaStatus.PAGO,
            data_pagamento: data.data_pagamento,
            tipo_pagamento: data.tipo_pagamento,
            valor_pago: data.valor_pago,
            pagamento_manual: true,
        });
    },

    fetchAvailableYears: (passageiroId: string) =>
        apiClient
            .get(`/cobrancas/passageiro/${passageiroId}/anos-disponiveis`)
            .then(res => res.data),

    fetchNotificacoesByCobrancaId: (cobrancaId: string) =>
        apiClient
            .get(`/cobrancas/${cobrancaId}/notificacoes`)
            .then(res => res.data),

    enviarNotificacaoByCobrancaId: (cobrancaId: string) => {
        const payload = {
            cobranca_id: cobrancaId,
            tipo_origem: 'manual',
            tipo_evento: 'COBRANCA_MANUAL',
            canal: 'whatsapp',
        };

        return apiClient
            .post(`/cobrancas/${cobrancaId}/notificacoes`, payload)
            .then(res => res.data);
    },

    toggleNotificacoes: (passageiroId: string, novoStatus: boolean) =>
        apiClient
            .patch(`/cobrancas/${passageiroId}/toggle-notificacoes`, { novoStatus })
            .then(res => res.data),

};
