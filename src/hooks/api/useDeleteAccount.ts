import { supabase } from "@/integrations/supabase/client";
import { clearLoginStorageMotorista } from "@/utils/domain/motorista/motoristaUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            console.log('aqui');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // @ts-ignore - RPC novo, ainda não gerado types
            const { error } = await supabase.rpc('anonymize_user_account', {
                target_user_id: user.id
            });

            if (error) throw error;
        },
        onSuccess: async () => {
             // 1. Limpar cache do react-query
             queryClient.clear();
             
             // 2. Logout do Supabase
             await supabase.auth.signOut();

             // 3. Limpar storage local
             clearLoginStorageMotorista();

             // 4. Force reload para login
             window.location.href = "/login";
        }
    });
};
