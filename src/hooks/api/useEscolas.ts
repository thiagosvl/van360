import { escolaApi } from "@/services/api/escola.api";
import { FilterDefaults } from "@/types/enums";
import { Escola } from "@/types/escola";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export interface UseEscolasFilters {
  usuarioId?: string;
  search?: string;
  status?: string;
}

export function useEscolas(
  filters: UseEscolasFilters | string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const safeFilters: UseEscolasFilters =
    typeof filters === "object" && filters !== null
      ? filters
      : { usuarioId: String(filters || "") };

  const { usuarioId, search, status } = safeFilters;

  const searchStr = typeof search === "string" ? search : undefined;

  const apiFilters = {
    search: searchStr?.trim() ? searchStr.trim() : undefined,
    ativo: status && status !== FilterDefaults.TODOS ? status : undefined,
    comContagem: "true",
  };

  const queryKey = ["escolas", usuarioId, JSON.stringify(apiFilters)];

  const query = useQuery({
    queryKey,
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<(Escola & { passageiros_ativos_count?: number })[]> => {
      if (!usuarioId) return [];

      const data = await escolaApi.listEscolas(usuarioId, apiFilters);
      return data ?? [];
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
