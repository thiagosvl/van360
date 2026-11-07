import { useQuery } from "@tanstack/react-query";
import { cobrancaApi } from "@/services/api/cobranca.api";
import { CobrancaLembreteEnviado } from "@/types/cobranca";

export function useCobrancaLembretesEnviados(
  cobrancaId?: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<CobrancaLembreteEnviado[]>({
    queryKey: ["cobranca-lembretes-enviados", cobrancaId],
    enabled: (options?.enabled ?? true) && Boolean(cobrancaId),
    queryFn: async () => {
      if (!cobrancaId) return [];
      return cobrancaApi.listarLembretesEnviados(cobrancaId);
    },
    staleTime: 30_000,
  });
}
