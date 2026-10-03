import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminRepasseApi, ListAdminRepassesParams } from "@/services/api/admin/admin-repasse.api";

export const ADMIN_REPASSE_KEYS = {
  all: ["admin", "repasses"] as const,
  list: (params?: ListAdminRepassesParams) => ["admin", "repasses", "list", params] as const,
  stats: (params?: { data_inicio?: string; data_fim?: string; motorista_id?: string }) =>
    ["admin", "repasses", "stats", params] as const,
};

export function useAdminRepasses(params?: ListAdminRepassesParams) {
  return useQuery({
    queryKey: ADMIN_REPASSE_KEYS.list(params),
    queryFn: () => adminRepasseApi.listRepasses(params),
  });
}

export function useAdminRepasseKpis(params?: { data_inicio?: string; data_fim?: string; motorista_id?: string }) {
  return useQuery({
    queryKey: ADMIN_REPASSE_KEYS.stats(params),
    queryFn: () => adminRepasseApi.getStats(params),
  });
}

export function useAdminRetryRepasse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRepasseApi.retryRepasse(id),
    onSuccess: async (data) => {
      toast.success(data?.message || "Repasse reenfileirado para processamento imediato.");
      await qc.invalidateQueries({ queryKey: ADMIN_REPASSE_KEYS.all });
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string; message?: string } } };
      const msg =
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        "Falha ao retentar processamento do repasse.";
      toast.error(msg);
    },
  });
}
