import { assinaturaCobrancaApi } from "@/services/api/assinatura-cobranca.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAssinaturaCobrancas(
  filtros?: Record<string, string>,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery({
    queryKey: ["assinatura-cobrancas", filtros],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const data = await assinaturaCobrancaApi.listAssinaturaCobrancas(filtros);
      return (data as any[]) ?? [];
    },
  });

  useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}

export function useAssinaturaCobranca(
  cobrancaId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery({
    queryKey: ["assinatura-cobranca", cobrancaId],
    enabled: (options?.enabled ?? true) && Boolean(cobrancaId),
    queryFn: async () => {
      if (!cobrancaId) return null;
      const data = await assinaturaCobrancaApi.getAssinaturaCobranca(cobrancaId);
      return data ?? null;
    },
  });

  useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}

