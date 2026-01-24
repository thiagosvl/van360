import { planoApi } from "@/services/api/plano.api";
import { Plano, SubPlano } from "@/types/plano";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function usePlanos(
  filtros?: Record<string, string>,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery<{ bases: Plano[]; sub: SubPlano[] }>({
    queryKey: ["planos", filtros],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const data = await planoApi.getPlanos(filtros);
      const bases = (data as any[]).filter((p: any) => p.tipo === "base") as Plano[];
      const sub = (data as any[]).filter((p: any) => p.tipo === "sub") as SubPlano[];
      return { bases, sub };
    },
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });

  useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}

export function useCalcularPrecoPreview() {
  return useMutation({
    mutationFn: async (quantidade: number) => {
      return await planoApi.calcularPrecoPreview(quantidade);
    },
  });
}

