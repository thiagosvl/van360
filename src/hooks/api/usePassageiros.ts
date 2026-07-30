import { passageiroApi } from "@/services/api/passageiro.api";
import { FilterDefaults } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface UsePassageirosFilters {
  usuarioId?: string;
  search?: string;
  escola?: string;
  veiculo?: string;
  status?: string;
  periodo?: string;
}

function normalizeFilters(filters: UsePassageirosFilters = {}) {
  const searchVal = typeof filters?.search === "string" ? filters.search : undefined;
  return {
    search: searchVal?.trim() ? searchVal.trim() : undefined,
    escola:
      filters?.escola && filters.escola !== FilterDefaults.TODAS ? filters.escola : undefined,
    veiculo:
      filters?.veiculo && filters.veiculo !== FilterDefaults.TODOS ? filters.veiculo : undefined,
    ativo:
      filters?.status && filters.status !== FilterDefaults.TODOS
        ? filters.status === "true"
          ? "true"
          : filters.status === "false"
            ? "false"
            : undefined
        : undefined,
    periodo:
      filters?.periodo && filters.periodo !== FilterDefaults.TODOS ? filters.periodo : undefined,
  };
}

export function usePassageiros(
  filters: UsePassageirosFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const safeFilters = typeof filters === "object" && filters !== null ? filters : { usuarioId: String(filters || "") };
  const normalizedFilters = normalizeFilters(safeFilters);
  const filterKey = JSON.stringify(normalizedFilters);

  const query = useQuery({
    queryKey: ["passageiros", safeFilters.usuarioId, filterKey],
    enabled: (options?.enabled ?? true) && Boolean(safeFilters.usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Passageiro[]> => {
      if (!safeFilters.usuarioId) return [];

      const data = await passageiroApi.listPassageiros(
        safeFilters.usuarioId,
        normalizedFilters
      );

      return data ?? [];
    },
    select: (passageiros): {
      list: Passageiro[];
      total: number;
      ativos: number;
    } => {
      const list = passageiros ?? [];
      const ativos = list.filter((p) => p.ativo).length;

      return {
        list,
        total: list.length,
        ativos,
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
