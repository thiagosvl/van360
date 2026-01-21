import { gastoApi } from "@/services/api/gasto.api";
import { Gasto } from "@/types/gasto";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface UseGastosFilters {
  usuarioId?: string;
  mes: number;
  ano: number;
  categoria?: string;
  veiculoId?: string;
}

const buildQueryKey = (filters: UseGastosFilters) => [
  "gastos",
  filters.usuarioId,
  filters.ano,
  filters.mes,
  filters.categoria || "todas",
  filters.veiculoId || "todos",
];

export function useGastos(
  filters: UseGastosFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery<Gasto[]>({
    queryKey: buildQueryKey(filters),
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    placeholderData: keepPreviousData,
    // Considera os dados stale imediatamente para garantir refetch quando necessário
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const data = await gastoApi.listGastos(filters.usuarioId, {
        mes: filters.mes.toString(),
        ano: filters.ano.toString(),
        categoria: filters.categoria && filters.categoria !== "todas" ? filters.categoria : undefined,
        veiculoId: filters.veiculoId && filters.veiculoId !== "todos" ? filters.veiculoId : undefined,
      });

      return (data as Gasto[]) ?? [];
    },
  });

  useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}
