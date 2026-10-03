import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminRepasseApi } from "@/services/api/admin/admin-repasse.api";
import { MotoristaConfiguracaoFinanceira } from "@/types/admin-repasse";

export const ADMIN_MOTORISTA_FINANCEIRO_KEYS = {
  all: ["admin", "motorista-financeiro"] as const,
  detail: (userId: string) => ["admin", "motorista-financeiro", userId] as const,
};

export function useAdminMotoristaFinanceiro(userId?: string) {
  return useQuery({
    queryKey: ADMIN_MOTORISTA_FINANCEIRO_KEYS.detail(userId || ""),
    queryFn: () => adminRepasseApi.getMotoristaConfiguracaoFinanceira(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdminUpdateMotoristaFinanceiro() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<MotoristaConfiguracaoFinanceira> }) =>
      adminRepasseApi.updateMotoristaConfiguracaoFinanceira(userId, data),
    onSuccess: async (_, variables) => {
      toast.success("Configurações financeiras do motorista atualizadas com sucesso!");
      await qc.invalidateQueries({ queryKey: ADMIN_MOTORISTA_FINANCEIRO_KEYS.detail(variables.userId) });
      qc.invalidateQueries({ queryKey: ["admin", "users", variables.userId] });
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string; message?: string } } };
      const msg =
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        "Falha ao atualizar configurações financeiras do motorista.";
      toast.error(msg);
    },
  });
}
