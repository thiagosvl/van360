import { useQuery } from "@tanstack/react-query";
import {
  adminUserApi,
  type VencimentosPassageirosResponse,
  type VencimentoDetalhesResponse,
} from "@/services/api/admin/admin-user.api";

const KEYS = {
  vencimentosPorDia: ["admin", "vencimentos-por-dia"] as const,
  vencimentoDetalhes: (dia: number, mes?: number, ano?: number) =>
    ["admin", "vencimento-detalhes", dia, mes, ano] as const,
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

export function useAdminVencimentoDetalhes(dia: number | null, mes?: number, ano?: number) {
  return useQuery<VencimentoDetalhesResponse>({
    queryKey: KEYS.vencimentoDetalhes(dia ?? 0, mes, ano),
    queryFn: () => adminUserApi.getVencimentoDetalhes(dia!, mes, ano),
    enabled: dia !== null && dia > 0,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}
