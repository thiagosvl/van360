import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface UseCobrancasFilters {
  usuarioId?: string;
  mes: number;
  ano: number;
}

const buildQueryKey = (filters: UseCobrancasFilters) => [
  "cobrancas",
  filters.usuarioId,
  filters.ano,
  filters.mes,
];

export function useCobrancas(
  filters: UseCobrancasFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery<Cobranca[], unknown, { all: Cobranca[]; abertas: Cobranca[]; pagas: Cobranca[] }>({
    queryKey: buildQueryKey(filters),
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    // Considera os dados stale imediatamente para garantir refetch quando necessário
    staleTime: 0,
    // Sempre refetch quando o componente montar para garantir dados atualizados
    // Isso é importante porque cobranças podem ter sido atualizadas em outras telas
    refetchOnMount: "always",
    // Refetch quando a janela ganhar foco para garantir dados atualizados
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const data = await cobrancaApi.listCobrancasWithFilters({
        usuarioId: filters.usuarioId,
        mes: String(filters.mes),
        ano: String(filters.ano),
      });

      return (data as Cobranca[]) ?? [];
    },
    select: (cobrancas): {
      all: Cobranca[];
      abertas: Cobranca[];
      pagas: Cobranca[];
    } => {
      // Garantir que cobrancas seja sempre um array
      // Pode acontecer de receber dados já transformados do cache em alguns casos
      if (!Array.isArray(cobrancas)) {
        return {
          all: [],
          abertas: [],
          pagas: [],
        };
      }

      const all = cobrancas;
      const abertas = all.filter((cobranca) => cobranca.status !== CobrancaStatus.PAGO);
      const pagas = all.filter((cobranca) => cobranca.status === CobrancaStatus.PAGO);

      return {
        all,
        abertas,
        pagas,
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
