import { useQuery } from "@tanstack/react-query";
import { veiculoApi } from "@/services/api/veiculo.api";
import { Veiculo } from "@/types/veiculo";
import { useEffect, useRef } from "react";

/**
 * Hook para buscar veículos com filtros customizados (usado em formulários)
 */
export function useVeiculosWithFilters(
  usuarioId?: string,
  filtros?: Record<string, string>,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  // Criar uma chave estável para o queryKey baseada nos filtros
  const filterKey = filtros ? JSON.stringify(filtros) : undefined;
  
  const query = useQuery({
    queryKey: ["veiculos-form", usuarioId, filterKey],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    // Sempre refazer a requisição quando os filtros mudarem ou quando o componente montar
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!usuarioId) return [];
      const queryFilters = { slim: "true", ...filtros };
      const data = await veiculoApi.listVeiculos(usuarioId, queryFilters);
      return (data as Veiculo[]) ?? [];
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

