import { asaasService } from "@/integrations/asaasService";
import { supabase } from "@/integrations/supabase/client";


const apiKey = localStorage.getItem("asaas_api_key");

/**
 * Desfaz um pagamento, revertendo o status no Supabase e, se aplicável, no Asaas.
 * Inclui lógica de rollback para garantir a consistência dos dados.
 *
 * @param cobrancaId O ID da cobrança a ser desfeita.
 * @param apiKey A chave da API do Asaas (pode ser null se não for usada).
 * @throws Lança um erro se qualquer etapa do processo falhar.
 */
export const cobrancaService = {
    async desfazerPagamento(cobrancaId: string): Promise<void> {
        // 1. Busca a cobrança para obter todos os dados necessários.
        const { data: cobranca, error: fetchError } = await supabase
            .from("cobrancas")
            .select("*")
            .eq("id", cobrancaId)
            .single();

        if (fetchError || !cobranca) {
            throw new Error("Não foi possível localizar a mensalidade para desfazer o pagamento.");
        }

        // Guarda um snapshot para o caso de precisarmos de rollback.
        const originalState = { ...cobranca };

        // 2. Tenta reverter o status no Supabase primeiro.
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

        if (cobranca.origem === "automatica" && cobranca.asaas_payment_id && apiKey) {
            try {
                await asaasService.undoPaymentInCash(cobranca.asaas_payment_id, apiKey);
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
};