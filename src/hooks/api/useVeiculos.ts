import { veiculoApi } from "@/services/api/veiculo.api";
import { FilterDefaults } from "@/types/enums";
import { Veiculo } from "@/types/veiculo";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

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
    ativo: status && status !== FilterDefaults.TODOS ? status : undefined,
    comContagem: "true",
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
    queryFn: async (): Promise<(Veiculo & { passageiros_ativos_count?: number })[]> => {
      if (!usuarioId) return [];

      const data = await veiculoApi.listVeiculos(usuarioId, apiFilters);
      return data ?? [];
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
