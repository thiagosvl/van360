import { useQuery } from "@tanstack/react-query";
import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";

export function useCobrancasByPassageiro(
  passageiroId?: string,
  ano?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["cobrancas-by-passageiro", passageiroId, ano],
    enabled: (options?.enabled ?? true) && Boolean(passageiroId),
    keepPreviousData: true,
    // Sempre refetch quando o componente montar para garantir dados atualizados
    // Isso é importante porque cobranças podem ter sido atualizadas em outras telas
    refetchOnMount: "always",
    queryFn: async () => {
      if (!passageiroId) return [];
      const data = await cobrancaApi.listCobrancasByPassageiro(passageiroId, ano);
      return (data as Cobranca[]) ?? [];
    },
    onError: options?.onError,
  });
}

