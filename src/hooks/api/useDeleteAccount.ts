import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { apiClient } from "@/services/api/client";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    const { user } = useSession();

    return useMutation({
        mutationFn: async () => {
            if (!user?.id) throw new Error("Usuário não autenticado");

            // Substituído RPC direto por chamada ao Backend para garantir limpeza do Whatsapp
            await apiClient.delete(`/usuarios/${user.id}`);
        },
        onSuccess: async () => {
             // 1. Limpar cache do react-query
             queryClient.clear();
             
             // 2. Logout do Supabase
             await apiClient.post("/auth/logout");

             // 3. Limpar storage local
             clearAppSession();

             // 4. Force reload para login
             window.location.href = ROUTES.PUBLIC.LOGIN;
        }
    });
};
