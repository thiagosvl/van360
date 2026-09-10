import { useQuery } from "@tanstack/react-query";
import { adminUserApi, type VencimentosPassageirosResponse } from "@/services/api/admin/admin-user.api";

const KEYS = {
  vencimentosPorDia: ["admin", "vencimentos-por-dia"] as const,
};

export function useAdminVencimentosPorDia() {
  return useQuery<VencimentosPassageirosResponse>({
    queryKey: KEYS.vencimentosPorDia,
    queryFn: adminUserApi.getVencimentosPorDia,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });
}
