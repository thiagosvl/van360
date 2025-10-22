import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { supabase } from "@/integrations/supabase/client";

export const configuracoesMotoristaService = {
    async saveConfiguracoes(configuracoes: any) {
        const storageKey = STORAGE_KEY_QUICKSTART_STATUS;
        const cached = localStorage.getItem(storageKey);
        const previousStatus = cached ? JSON.parse(cached) : null;

        try {
            const { error } = await supabase
                .from("configuracoes_motoristas")
                .update({
                    ...configuracoes
                })
                .eq("id", configuracoes.id);

            if (error) throw error;

            try {
                const status = previousStatus ? { ...previousStatus } : {};
                status.step_configuracoes = true;
                localStorage.setItem(storageKey, JSON.stringify(status));
            } catch (localErr) {
                console.error("Erro ao atualizar QuickStart (configurações):", localErr);
            }

            return { success: true };
        } catch (err) {
            console.error("Erro ao salvar configurações:", err);

            try {
                if (previousStatus) {
                    localStorage.setItem(storageKey, JSON.stringify(previousStatus));
                    console.log("↩️ QuickStart revertido ao estado anterior (configurações).");
                }
            } catch (rollbackErr) {
                console.error("Erro ao reverter QuickStart (configurações):", rollbackErr);
            }

            throw err;
        }
    },
};
