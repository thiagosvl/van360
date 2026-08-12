import { useQuery } from "@tanstack/react-query";
import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";
import { useEffect, useRef } from "react";

export function useCobranca(
  cobrancaId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery({
    queryKey: ["cobranca", cobrancaId],
    enabled: (options?.enabled ?? true) && Boolean(cobrancaId),
    queryFn: async () => {
      if (!cobrancaId) return null;
      const data = await cobrancaApi.getCobranca(cobrancaId);
      return (data as Cobranca) ?? null;
    },
    // Refetch quando o componente montar sempre (para garantir dados atualizados)
    refetchOnMount: "always",
    // Refetch quando a janela receber foco se os dados estiverem stale
    refetchOnWindowFocus: true,
    // Considera os dados stale após 0ms (sempre refetch se necessário)
    staleTime: 0,
  });

  const onErrorRef = useRef(options?.onError);
  useEffect(() => {
    onErrorRef.current = options?.onError;
  });

  useEffect(() => {
    if (query.error && onErrorRef.current) {
      onErrorRef.current(query.error);
    }
  }, [query.error]);

  return query;
}

