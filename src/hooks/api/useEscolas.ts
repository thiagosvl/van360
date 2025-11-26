import { useQuery } from "@tanstack/react-query";
import { escolaApi } from "@/services/api/escola.api";
import { Escola } from "@/types/escola";

export function useEscolas(
  usuarioId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["escolas", usuarioId],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    keepPreviousData: true,
    // Considera os dados stale imediatamente para garantir refetch quando necessário
    staleTime: 0,
    // Sempre refetch quando o componente montar para garantir dados atualizados
    refetchOnMount: "always",
    // Refetch quando a janela ganhar foco para garantir dados atualizados
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!usuarioId) return [];

      const data = await escolaApi.listEscolasComContagemAtivos(usuarioId);
      return (data as (Escola & { passageiros_ativos_count?: number })[]) ?? [];
    },
    select: (escolas): {
      list: (Escola & { passageiros_ativos_count?: number })[];
      total: number;
      ativas: number;
    } => {
      const list = escolas ?? [];
      const ativas = list.filter((escola) => escola.ativo).length;

      return {
        list,
        total: list.length,
        ativas,
      };
    },
    onError: options?.onError,
  });
}

