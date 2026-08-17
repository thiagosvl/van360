import { ListPassageirosResponse, passageiroApi } from "@/services/api/passageiro.api";
import { FilterDefaults } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export interface UsePassageirosFilters {
  usuarioId?: string;
  search?: string;
  escola?: string;
  veiculo?: string;
  status?: string;
  periodo?: string;
  page?: number;
  limit?: number;
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
    page: filters?.page && filters.page > 0 ? filters.page : undefined,
    limit: filters?.limit && filters.limit > 0 ? filters.limit : undefined,
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
    queryFn: async (): Promise<ListPassageirosResponse> => {
      if (!safeFilters.usuarioId) return { list: [], total: 0 };

      const data = await passageiroApi.listPassageiros(
        safeFilters.usuarioId,
        normalizedFilters
      );

      return data ?? { list: [], total: 0 };
    },
    select: (data): {
      list: Passageiro[];
      total: number;
      ativos: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    } => {
      const list = data?.list ?? (Array.isArray(data) ? data : []);
      const total = data?.total ?? list.length;
      const ativos = list.filter((p) => p.ativo).length;

      return {
        list,
        total,
        ativos,
        page: data?.page,
        limit: data?.limit,
        totalPages: data?.totalPages,
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
