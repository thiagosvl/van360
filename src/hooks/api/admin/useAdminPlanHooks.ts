import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPlanApi, type UpdatePlanPayload } from "@/services/api/admin/admin-plan.api";
import { toast } from "@/utils/notifications/toast";

const KEYS = {
  plans: ["admin", "plans"] as const,
};

export function useAdminPlans() {
  return useQuery({
    queryKey: KEYS.plans,
    queryFn: adminPlanApi.getPlans,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanPayload }) =>
      adminPlanApi.updatePlan(id, data),
    onSuccess: () => {
      toast.success("Preço do plano atualizado com sucesso.");
      qc.invalidateQueries({ queryKey: KEYS.plans });
    },
    onError: () => {
      toast.error("Erro ao salvar preço do plano.");
    },
  });
}
