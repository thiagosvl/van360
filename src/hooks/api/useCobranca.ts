import { useQuery } from "@tanstack/react-query";
import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";

export function useCobranca(
  cobrancaId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["cobranca", cobrancaId],
    enabled: (options?.enabled ?? true) && Boolean(cobrancaId),
    queryFn: async () => {
      if (!cobrancaId) return null;
      const data = await cobrancaApi.getCobranca(cobrancaId);
      return (data as Cobranca) ?? null;
    },
    onError: options?.onError,
    // Refetch quando o componente montar sempre (para garantir dados atualizados)
    refetchOnMount: "always",
    // Refetch quando a janela receber foco se os dados estiverem stale
    refetchOnWindowFocus: true,
    // Considera os dados stale após 0ms (sempre refetch se necessário)
    staleTime: 0,
  });
}

export function useCobrancaNotificacoes(
  cobrancaId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["cobranca-notificacoes", cobrancaId],
    enabled: (options?.enabled ?? true) && Boolean(cobrancaId),
    queryFn: async () => {
      if (!cobrancaId) return [];
      const data = await cobrancaApi.fetchNotificacoesByCobrancaId(cobrancaId);
      return (data as any[]) ?? [];
    },
    onError: options?.onError,
    // Refetch quando o componente montar sempre (para garantir dados atualizados)
    refetchOnMount: "always",
    // Refetch quando a janela receber foco se os dados estiverem stale
    refetchOnWindowFocus: true,
    // Considera os dados stale após 0ms (sempre refetch se necessário)
    staleTime: 0,
  });
}

