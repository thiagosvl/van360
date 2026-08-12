import { passageiroApi } from "@/services/api/passageiro.api";
import { Passageiro } from "@/types/passageiro";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function usePassageiro(
  passageiroId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery({
    queryKey: ["passageiro", passageiroId],
    enabled: (options?.enabled ?? true) && Boolean(passageiroId),
    queryFn: async () => {
      if (!passageiroId) return null;
      const data = await passageiroApi.getPassageiro(passageiroId);
      return data as Passageiro;
    },
    // Refetch quando o componente montar sempre (para garantir dados atualizados)
    refetchOnMount: "always",
    // Refetch quando a janela receber foco se os dados estiverem stale
    refetchOnWindowFocus: false,
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
