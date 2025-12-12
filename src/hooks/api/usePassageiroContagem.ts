import { passageiroApi } from "@/services/api/passageiro.api";
import { useQuery } from "@tanstack/react-query";

export function usePassageiroContagem(
  usuarioId?: string,
  filtros?: Record<string, string>,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery<{ count: number }>({
    queryKey: ["passageiros-contagem", usuarioId, filtros],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    queryFn: async () => {
      if (!usuarioId) return { count: 0 };
      const data = await passageiroApi.getContagemByUsuario(usuarioId, filtros);
      return typeof data === 'object' && data?.count !== undefined 
        ? data 
        : { count: typeof data === 'number' ? data : 0 };
    },
    //@ts-ignore
    onError: options?.onError,
  });
}

