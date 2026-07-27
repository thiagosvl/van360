import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { prePassageiroApi } from "@/services/api/pre-passageiro.api";
import { PrePassageiro } from "@/types/prePassageiro";

export interface UsePrePassageirosFilters {
  usuarioId?: string;
  search?: string;
}

const buildQueryKey = (filters: UsePrePassageirosFilters) => [
  "pre-passageiros",
  filters.usuarioId,
  filters.search || "",
];

export function usePrePassageiros(
  filters: UsePrePassageirosFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const onErrorRef = useRef(options?.onError);
  
  useEffect(() => {
    onErrorRef.current = options?.onError;
  }, [options?.onError]);

  const query = useQuery({
    queryKey: buildQueryKey(filters),
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    staleTime: 0,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const data = await prePassageiroApi.listPrePassageiros(
        filters.usuarioId,
        filters.search
      );

      return (data as PrePassageiro[]) ?? [];
    },
  });

  useEffect(() => {
    if (query.isError && onErrorRef.current) {
      onErrorRef.current(query.error);
    }
  }, [query.isError, query.error, query.errorUpdatedAt]);

  return query;
}

