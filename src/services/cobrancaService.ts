import { supabase } from "@/integrations/supabase/client";
import { asaasService } from "@/services/asaasService";
import { Cobranca } from "@/types/cobranca";
import { CobrancaDetalhe } from "@/types/cobrancaDetalhe";
import { CobrancaNotificacao } from "@/types/cobrancaNotificacao";

export const cobrancaService = {
    async desfazerPagamento(cobrancaId: string): Promise<void> {
        const asaasApiKey = localStorage.getItem("asaas_api_key");

        const { data: cobranca, error: fetchError } = await supabase
            .from("cobrancas")
            .select("*")
            .eq("id", cobrancaId)
            .single();

        if (fetchError || !cobranca) {
            throw new Error("Não foi possível localizar a mensalidade para desfazer o pagamento.");
        }

        const originalState = { ...cobranca };

        const { error: updateError } = await supabase
            .from("cobrancas")
            .update({
                status: "pendente",
                data_pagamento: null,
                tipo_pagamento: null,
                pagamento_manual: false,
            })
            .eq("id", cobrancaId);

        if (updateError) {
            throw new Error("Falha ao atualizar o status da cobrança no banco de dados.");
        }

        if (cobranca.origem === "automatica" && cobranca.asaas_payment_id && asaasApiKey) {
            try {
                await asaasService.undoPaymentInCash(cobranca.asaas_payment_id, asaasApiKey);
            } catch (asaasErr) {
                console.error("Erro ao desfazer o pagamento no Asaas. Iniciando rollback...", asaasErr);
                await supabase
                    .from("cobrancas")
                    .update({
                        status: originalState.status,
                        data_pagamento: originalState.data_pagamento,
                        tipo_pagamento: originalState.tipo_pagamento,
                        pagamento_manual: originalState.pagamento_manual,
                    })
                    .eq("id", cobrancaId);

                throw new Error("Erro ao comunicar com o provedor de pagamento. A alteração foi desfeita.");
            }
        }
    },

    async excluirCobranca(cobranca: Cobranca | CobrancaDetalhe): Promise<void> {
        const asaasApiKey = localStorage.getItem("asaas_api_key");

        if (cobranca.origem === "automatica" && cobranca.asaas_payment_id && asaasApiKey) {
            try {
                await asaasService.deletePayment(cobranca.asaas_payment_id, asaasApiKey);
            } catch (asaasErr) {
                console.error("Erro ao excluir pagamento no Asaas. A operação foi abortada.", asaasErr);
                throw new Error("Falha ao excluir a cobrança no provedor de pagamento.");
            }
        }

        const { error } = await supabase
            .from("cobrancas")
            .delete()
            .eq("id", cobranca.id);

        if (error) {
            throw new Error("Falha ao excluir a cobrança do banco de dados.");
        }
    },

    async toggleNotificacoes(cobranca: Cobranca | CobrancaDetalhe): Promise<boolean> {
        const novoStatus = !cobranca.desativar_lembretes;

        const { error } = await supabase
            .from("cobrancas")
            .update({ desativar_lembretes: novoStatus })
            .eq("id", cobranca.id);

        if (error) {
            throw new Error("Falha ao atualizar o status dos lembretes no banco de dados.");
        }

        return novoStatus;
    },

    async getNotificacoesByCobrancaId(cobrancaId: string): Promise<CobrancaNotificacao[]> {
        try {
            const { data, error } = await supabase
                .from('cobranca_notificacoes')
                .select('*')
                .eq('cobranca_id', cobrancaId)
                .order('data_envio', { ascending: false });

            if (error) {
                console.error("Erro ao buscar notificações:", error);
                throw new Error('Não foi possível carregar o histórico de notificações.');
            }

            return data as CobrancaNotificacao[];

        } catch (error) {
            console.error("Erro no CobrancaService.getNotificacoesByCobrancaId:", error);
            return [];
        }
    },

    async enviarNotificacao(cobranca: Cobranca | CobrancaDetalhe): Promise<boolean> {
        try {
            const sucessoEnvio = true;

            if (sucessoEnvio) {
                const { error: logError } = await supabase
                    .from('cobranca_notificacoes')
                    .insert({
                        cobranca_id: cobranca.id,
                        tipo_origem: 'manual',
                        tipo_evento: 'REENVIO_MANUAL',
                        canal: 'whatsapp',
                    });

                if (logError) {
                    console.error("Erro ao logar notificação no Supabase:", logError);
                }

                return true;
            } else {
                console.error(`[CobrancaService] Falha no envio da notificação para: ${cobranca.id}`);
                return false;
            }
        } catch (error) {
            console.error("Erro no processo de envio de notificação:", error);
            return false;
        }
    },

    async registrarPagamentoManual(cobrancaId: string, pagamentoData: any): Promise<void> {
        const asaasApiKey = localStorage.getItem("asaas_api_key");
        
        const { data: cobranca, error: fetchError } = await supabase
            .from("cobrancas")
            .select("id, origem, asaas_payment_id, data_vencimento")
            .eq("id", cobrancaId)
            .single();

        if (fetchError || !cobranca) {
            throw new Error("Não foi possível localizar a mensalidade para registrar o pagamento.");
        }

        if (cobranca.origem === "automatica" && cobranca.asaas_payment_id && asaasApiKey) {
            try {
                await asaasService.confirmPaymentInCash(
                    cobranca.asaas_payment_id,
                    pagamentoData.data_pagamento,
                    pagamentoData.valor_pago,
                    asaasApiKey
                );
            } catch (asaasErr) {
                console.error("Erro ao confirmar pagamento no Asaas.", asaasErr);
                throw new Error("Falha ao registrar o pagamento no provedor externo.");
            }
        }

        const { error } = await supabase
            .from("cobrancas")
            .update({
                status: "pago",
                data_pagamento: pagamentoData.data_pagamento,
                tipo_pagamento: pagamentoData.tipo_pagamento,
                valor: pagamentoData.valor_pago,
                pagamento_manual: true,
            })
            .eq("id", cobrancaId);

        if (error) {
            if (cobranca.origem === "automatica" && cobranca.asaas_payment_id && asaasApiKey) {
                try {
                    await asaasService.undoPaymentInCash(cobranca.asaas_payment_id, asaasApiKey);
                } catch (undoErr) {
                    console.error("ERRO CRÍTICO: Falha ao registrar no Supabase e falha ao reverter no Asaas.", undoErr);
                }
            }
            throw new Error("Falha ao atualizar a cobrança no banco de dados.");
        }
    },

    async fetchAvailableYears(passageiroId: string): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('cobrancas')
            .select('ano')
            .eq('passageiro_id', passageiroId)
            .order('ano', { ascending: false });

        if (error) throw error;
        
        const uniqueYears = Array.from(new Set(data.map(item => item.ano.toString())));
        
        const currentYear = new Date().getFullYear().toString();
        
        if (!uniqueYears.includes(currentYear)) {
            uniqueYears.unshift(currentYear);
        } else {
            const index = uniqueYears.indexOf(currentYear);
            if (index !== 0) {
                uniqueYears.splice(index, 1);
                uniqueYears.unshift(currentYear);
            }
        }

        return uniqueYears;

    } catch (error) {
        console.error("Erro ao buscar anos disponíveis:", error);
        return [new Date().getFullYear().toString()];
    }
}
};