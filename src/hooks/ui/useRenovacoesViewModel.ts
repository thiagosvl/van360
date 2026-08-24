import { useState, useCallback } from "react";
import {
  useRenovacoesList,
  useUpdateRenovacao,
  useVirarAnoLetivo,
  useReajusteLote,
} from "../api/useRenovacoes";
import { RenovacaoStatus } from "@/types/enums";

export const FILTER_ALL = "all";

export function useRenovacoesViewModel() {
  const [anoDestino, setAnoDestino] = useState<number>(new Date().getFullYear() + 1);
  const [statusFilter, setStatusFilter] = useState<string>(FILTER_ALL);
  const [escolaFilter, setEscolaFilter] = useState<string>(FILTER_ALL);
  const [periodoFilter, setPeriodoFilter] = useState<string>(FILTER_ALL);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, isLoading, refetch } = useRenovacoesList({
    ano_destino: anoDestino,
    status: statusFilter === FILTER_ALL ? undefined : statusFilter,
    escola_id: escolaFilter === FILTER_ALL ? undefined : escolaFilter,
    periodo: periodoFilter === FILTER_ALL ? undefined : periodoFilter,
    search: searchTerm || undefined,
  });

  const updateRenovacaoMutation = useUpdateRenovacao();
  const virarAnoMutation = useVirarAnoLetivo();
  const reajusteLoteMutation = useReajusteLote();

  const kpis = data?.kpis || {
    faturamento_atual: 0,
    faturamento_projetado: 0,
    percentual_crescimento: 0,
    contadores: {
      total_ativos: 0,
      confirmados: 0,
      pendentes: 0,
      nao_notificados: 0,
      saidas: 0,
    },
  };

  const passageiros = data?.passageiros || [];

  const handleConfirmarManual = useCallback(
    async (passageiroId: string) => {
      await updateRenovacaoMutation.mutateAsync({
        passageiroId,
        data: {
          ano_destino: anoDestino,
          status: RenovacaoStatus.CONFIRMADO,
        },
      });
    },
    [anoDestino, updateRenovacaoMutation]
  );

  const handleRegistrarSaida = useCallback(
    async (passageiroId: string) => {
      await updateRenovacaoMutation.mutateAsync({
        passageiroId,
        data: {
          ano_destino: anoDestino,
          status: RenovacaoStatus.RECUSADO,
        },
      });
    },
    [anoDestino, updateRenovacaoMutation]
  );

  const handleReativar = useCallback(
    async (passageiroId: string) => {
      await updateRenovacaoMutation.mutateAsync({
        passageiroId,
        data: {
          ano_destino: anoDestino,
          status: RenovacaoStatus.PENDENTE,
        },
      });
    },
    [anoDestino, updateRenovacaoMutation]
  );

  const handleUpdateValorInline = useCallback(
    async (passageiroId: string, novoValor: number) => {
      await updateRenovacaoMutation.mutateAsync({
        passageiroId,
        data: {
          ano_destino: anoDestino,
          novo_valor_cobranca: novoValor,
        },
      });
      await refetch();
    },
    [anoDestino, updateRenovacaoMutation, refetch]
  );

  return {
    anoDestino,
    setAnoDestino,
    statusFilter,
    setStatusFilter,
    escolaFilter,
    setEscolaFilter,
    periodoFilter,
    setPeriodoFilter,
    searchTerm,
    setSearchTerm,
    kpis,
    passageiros,
    isLoading,
    refetch,
    handleConfirmarManual,
    handleRegistrarSaida,
    handleReativar,
    handleUpdateValorInline,
    virarAnoMutation,
    reajusteLoteMutation,
    isUpdating: updateRenovacaoMutation.isPending,
  };
}
