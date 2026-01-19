import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/services/api/client";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            console.log('Solicitando exclusão de conta via Backend...');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Substituído RPC direto por chamada ao Backend para garantir limpeza do Whatsapp
            await apiClient.delete(`/usuario/${user.id}`);
        },
        onSuccess: async () => {
             // 1. Limpar cache do react-query
             queryClient.clear();
             
             // 2. Logout do Supabase
             await supabase.auth.signOut();

             // 3. Limpar storage local
             clearAppSession();

             // 4. Force reload para login
             window.location.href = "/login";
        }
    });
};
