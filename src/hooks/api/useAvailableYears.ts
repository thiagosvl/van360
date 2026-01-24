import { cobrancaApi } from "@/services/api/cobranca.api";
import { useQuery } from "@tanstack/react-query";

export function useAvailableYears(
  passageiroId?: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["available-years", passageiroId],
    enabled: (options?.enabled ?? true) && Boolean(passageiroId),
    queryFn: async () => {
      if (!passageiroId) return [];
      const data = await cobrancaApi.fetchAvailableYears(passageiroId);
      const years = (Array.isArray(data) ? data : []) as (string | number)[];
      // Garante que são strings e ordena do mais recente para o mais antigo
      return years.map(String).sort((a, b) => Number(b) - Number(a));
    },
  });
}

