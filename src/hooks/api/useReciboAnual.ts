import { useQuery } from "@tanstack/react-query";
import { cobrancaApi } from "@/services/api/cobranca.api";
import type { Tables } from "@/integrations/supabase/types";

export type ReciboAnual = Tables<"recibos_anuais">;

export function useReciboAnual(
  passageiroId?: string,
  ano?: number,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["recibo-anual", passageiroId, ano],
    enabled: Boolean(passageiroId) && Boolean(ano) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<ReciboAnual | null> => {
      if (!passageiroId || !ano) return null;
      const data = await cobrancaApi.obterReciboAnual(passageiroId, ano);
      return data ?? null;
    },
  });
}
