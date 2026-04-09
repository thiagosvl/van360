import { gastoApi } from "@/services/api/gasto.api";
import { FilterDefaults } from "@/types/enums";
import { Gasto } from "@/types/gasto";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDaysInMonthBR } from "@/utils/dateUtils";

export interface UseGastosFilters {
  usuarioId?: string;
  mes: number;
  ano: number;
  categoria?: string;
  veiculoId?: string;
  search?: string;
}

const buildQueryKey = (filters: UseGastosFilters) => [
  "gastos",
  filters.usuarioId,
  filters.ano,
  filters.mes,
  filters.categoria || FilterDefaults.TODAS,
  filters.veiculoId || FilterDefaults.TODOS,
  filters.search || "",
];

export function useGastos(
  filters: UseGastosFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery<Gasto[], unknown, { list: Gasto[]; total: number }>({
    queryKey: buildQueryKey(filters),
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const year = filters.ano;
      const month = String(filters.mes).padStart(2, "0");
      const lastDay = getDaysInMonthBR(filters.mes, year);

      const data = await gastoApi.listGastos(filters.usuarioId, {
        data_inicio: `${year}-${month}-01`,
        data_fim: `${year}-${month}-${lastDay}`,
        categoria:
          filters.categoria && filters.categoria !== FilterDefaults.TODAS
            ? filters.categoria
            : undefined,
        veiculo_id:
          filters.veiculoId && filters.veiculoId !== FilterDefaults.TODOS
            ? filters.veiculoId
            : undefined,
        search: filters.search?.trim() ? filters.search.trim() : undefined,
      });

      return (data as Gasto[]) ?? [];
    },
    select: (data) => ({
      list: data ?? [],
      total: data?.length ?? 0,
    }),
  });

  useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}

