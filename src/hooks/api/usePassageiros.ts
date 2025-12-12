import { passageiroApi } from "@/services/api/passageiro.api";
import { Passageiro } from "@/types/passageiro";
import { useQuery } from "@tanstack/react-query";

export interface UsePassageirosFilters {
  usuarioId?: string;
  search?: string;
  escola?: string;
  veiculo?: string;
  status?: string;
  periodo?: string;
}

function normalizeFilters(filters: UsePassageirosFilters) {
  return {
    search: filters.search?.trim() ? filters.search.trim() : undefined,
    escola:
      filters.escola && filters.escola !== "todas" ? filters.escola : undefined,
    veiculo:
      filters.veiculo && filters.veiculo !== "todos" ? filters.veiculo : undefined,
    status:
      filters.status && filters.status !== "todos"
        ? filters.status === "true"
          ? true
          : filters.status === "false"
          ? false
          : filters.status
        : undefined,
    periodo:
      filters.periodo && filters.periodo !== "todos" ? filters.periodo : undefined,
  };
}

export function usePassageiros(
  filters: UsePassageirosFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const normalizedFilters = normalizeFilters(filters);
  const filterKey = JSON.stringify(normalizedFilters);

  return useQuery({
    queryKey: ["passageiros", filters.usuarioId, filterKey],
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    // Cache de 1 minuto para evitar requests duplicados em componentes simultâneos (Home + QuickStart)
    staleTime: 1000 * 60,
    // Refetch apenas se dados estiverem obsoletos
    refetchOnMount: false,
    // Refetch quando a janela ganhar foco para manter dados frescos
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const data = await passageiroApi.listPassageiros(
        filters.usuarioId,
        normalizedFilters
      );

      return (data as Passageiro[]) ?? [];
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
    // onError: options?.onError, // Deprecated in v5
  });
}

