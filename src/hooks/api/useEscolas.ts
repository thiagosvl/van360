import { escolaApi } from "@/services/api/escola.api";
import { Escola } from "@/types/escola";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useEscolas(
  usuarioId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery({
    queryKey: ["escolas", usuarioId],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      if (!usuarioId) return [];

      const data = await escolaApi.listEscolasComContagemAtivos(usuarioId);
      return (data as (Escola & { passageiros_ativos_count?: number })[]) ?? [];
    },
    select: (escolas): {
      list: (Escola & { passageiros_ativos_count?: number })[];
      total: number;
      ativas: number;
    } => {
      const list = escolas ?? [];
      const ativas = list.filter((escola) => escola.ativo).length;

      return {
        list,
        total: list.length,
        ativas,
      };
    },
  });

  useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}

