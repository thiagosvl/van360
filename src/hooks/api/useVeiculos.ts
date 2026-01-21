import { veiculoApi } from "@/services/api/veiculo.api";
import { Veiculo } from "@/types/veiculo";
import { useQuery } from "@tanstack/react-query";

import { useEffect } from "react";

export function useVeiculos(
  usuarioId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery<
    (Veiculo & { passageiros_ativos_count?: number })[],
    unknown,
    {
      list: (Veiculo & { passageiros_ativos_count?: number })[];
      total: number;
      ativos: number;
    }
  >({
    queryKey: ["veiculos", usuarioId],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      if (!usuarioId) return [];

      const data = await veiculoApi.listVeiculosComContagemAtivos(usuarioId);
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

