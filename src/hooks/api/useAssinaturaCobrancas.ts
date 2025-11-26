import { useQuery } from "@tanstack/react-query";
import { assinaturaCobrancaApi } from "@/services/api/assinatura-cobranca.api";

export function useAssinaturaCobrancas(
  filtros?: Record<string, string>,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["assinatura-cobrancas", filtros],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const data = await assinaturaCobrancaApi.listAssinaturaCobrancas(filtros);
      return (data as any[]) ?? [];
    },
    onError: options?.onError,
  });
}

export function useAssinaturaCobranca(
  cobrancaId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["assinatura-cobranca", cobrancaId],
    enabled: (options?.enabled ?? true) && Boolean(cobrancaId),
    queryFn: async () => {
      if (!cobrancaId) return null;
      const data = await assinaturaCobrancaApi.getAssinaturaCobranca(cobrancaId);
      return data ?? null;
    },
    onError: options?.onError,
  });
}

