import { escolaApi } from "@/services/api/escola.api";
import { Escola } from "@/types/escola";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook para buscar escolas com filtros customizados (usado em formulários)
 */
export function useEscolasWithFilters(
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
    queryKey: ["escolas-form", usuarioId, filterKey],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    // Sempre refazer a requisição quando os filtros mudarem ou quando o componente montar
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!usuarioId) return [];
      const data = await escolaApi.listEscolas(usuarioId, filtros);
      return (data as Escola[]) ?? [];
    },
    onError: options?.onError,
  });
}

