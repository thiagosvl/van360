import { veiculoApi } from "@/services/api/veiculo.api";
import { Veiculo } from "@/types/veiculo";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface UseVeiculosFilters {
  usuarioId?: string;
  search?: string;
  status?: string;
}

export function useVeiculos(
  filters: UseVeiculosFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const { usuarioId, search, status } = filters || {};

  const apiFilters = {
    search: search?.trim() ? search.trim() : undefined,
    ativo: status && status !== "todos" ? status : undefined,
  };

  const queryKey = ["veiculos", usuarioId, JSON.stringify(apiFilters)];

  const query = useQuery<
    (Veiculo & { passageiros_ativos_count?: number })[],
    unknown,
    {
      list: (Veiculo & { passageiros_ativos_count?: number })[];
      total: number;
      ativos: number;
    }
  >({
    queryKey,
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      if (!usuarioId) return [];

      const data = await veiculoApi.listVeiculosComContagemAtivos(usuarioId, apiFilters);
      return (data as (Veiculo & { passageiros_ativos_count?: number })[]) ?? [];
    },
    select: (veiculos) => {
      const list = veiculos ?? [];
      const ativos = list.filter((veiculo) => veiculo.ativo).length;

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

