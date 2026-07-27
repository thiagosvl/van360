import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminConfigApi } from "@/services/api/admin/admin-config.api";
import { toast } from "@/utils/notifications/toast";

const KEYS = {
  configs: ["admin", "configs"] as const,
};

export function useAdminConfigs() {
  return useQuery({
    queryKey: KEYS.configs,
    queryFn: adminConfigApi.getConfigs,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chave, valor }: { chave: string; valor: string }) =>
      adminConfigApi.updateConfig(chave, valor),
    onSuccess: () => {
      toast.success("Configuração salva com sucesso.");
      qc.invalidateQueries({ queryKey: KEYS.configs });
    },
    onError: () => {
      toast.error("Erro ao salvar configuração.");
    },
  });
}
