import { useQuery } from "@tanstack/react-query";
import { cobrancaApi } from "@/services/api/cobranca.api";

export function useAvailableYears(
  passageiroId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["available-years", passageiroId],
    enabled: (options?.enabled ?? true) && Boolean(passageiroId),
    queryFn: async () => {
      if (!passageiroId) return [];
      const data = await cobrancaApi.fetchAvailableYears(passageiroId);
      const years = (data as string[]) ?? [];
      // Ordena do mais recente para o mais antigo (ordem decrescente)
      return years.sort((a, b) => Number(b) - Number(a));
    },
    onError: options?.onError,
  });
}

