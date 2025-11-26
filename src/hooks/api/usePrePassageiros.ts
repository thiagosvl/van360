import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: buildQueryKey(filters),
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    keepPreviousData: true,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const data = await prePassageiroApi.listPrePassageiros(
        filters.usuarioId,
        filters.search
      );

      return (data as PrePassageiro[]) ?? [];
    },
    onError: options?.onError,
  });
}

