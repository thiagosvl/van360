import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useCobrancasByPassageiro(
  passageiroId?: string,
  ano?: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["cobrancas-by-passageiro", passageiroId, ano],
    enabled: (options?.enabled ?? true) && Boolean(passageiroId),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!passageiroId) return [];
      const data = await cobrancaApi.listCobrancasByPassageiro(passageiroId, ano);
      return (data as Cobranca[]) ?? [];
    },
  });
}

