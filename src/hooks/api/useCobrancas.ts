import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export interface UseCobrancasFilters {
  usuarioId?: string;
  mes: number;
  ano: number;
  veiculoId?: string;
  search?: string;
}

const buildQueryKey = (filters: UseCobrancasFilters) => [
  "cobrancas",
  filters.usuarioId,
  filters.ano,
  filters.mes,
  filters.veiculoId || "",
  filters.search || "",
];

export function useCobrancas(
  filters: UseCobrancasFilters,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  const query = useQuery<Cobranca[], unknown, { all: Cobranca[]; areceber: Cobranca[]; recebidos: Cobranca[]; list: Cobranca[]; total: number }>({
    queryKey: buildQueryKey(filters),
    enabled: (options?.enabled ?? true) && Boolean(filters.usuarioId),
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!filters.usuarioId) return [];

      const data = await cobrancaApi.listCobrancasWithFilters({
        usuarioId: filters.usuarioId,
        mes: String(filters.mes),
        ano: String(filters.ano),
        veiculoId: filters.veiculoId,
        search: filters.search?.trim() ? filters.search.trim() : undefined,
      });

      return (data as Cobranca[]) ?? [];
    },
    select: (cobrancas): {
      all: Cobranca[];
      areceber: Cobranca[];
      recebidos: Cobranca[];
      list: Cobranca[];
      total: number;
    } => {
      // Garantir que cobrancas seja sempre um array
      // Pode acontecer de receber dados já transformados do cache em alguns casos
      if (!Array.isArray(cobrancas)) {
        return {
          all: [],
          areceber: [],
          recebidos: [],
          list: [],
          total: 0,
        };
      }

      const all = cobrancas.filter((cobranca) => cobranca.status !== CobrancaStatus.CANCELADA);
      
      const recebidos = all.filter((cobranca) => cobranca.status === CobrancaStatus.PAGO);
      const areceber = all.filter((cobranca) => cobranca.status === CobrancaStatus.PENDENTE);

      return {
        all,
        areceber,
        recebidos,
        list: all,
        total: all.length,
      };
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
