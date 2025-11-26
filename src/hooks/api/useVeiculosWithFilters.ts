import { useQuery } from "@tanstack/react-query";
import { veiculoApi } from "@/services/api/veiculo.api";
import { Veiculo } from "@/types/veiculo";

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
  
  return useQuery({
    queryKey: ["veiculos-form", usuarioId, filterKey],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    // Sempre refazer a requisição quando os filtros mudarem ou quando o componente montar
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!usuarioId) return [];
      const data = await veiculoApi.listVeiculos(usuarioId, filtros);
      return (data as Veiculo[]) ?? [];
    },
    onError: options?.onError,
  });
}

