import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/services/api/public.api";

/**
 * Hook para buscar planos SaaS públicos (Landing Page)
 * Não exige autenticação e retorna os valores atuais do banco.
 */
export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: () => publicApi.getPlans(),
    // Cache de 1 hora para a LP, já que os planos mudam pouco
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
}
