import { useState, useCallback, useMemo } from "react";
import {
  useRenovacoesList,
  useUpdateRenovacao,
  useVirarAnoLetivo,
  useReajusteLote,
  useAtualizarStatusLoteRenovacao,
} from "../api/useRenovacoes";
import { RenovacaoStatus } from "@/types/enums";
import { toast } from "sonner";

export const FILTER_ALL = "all";

export function useRenovacoesViewModel() {
  const [anoDestino, setAnoDestino] = useState<number>(new Date().getFullYear() + 1);
  const [statusFilter, setStatusFilter] = useState<string>(FILTER_ALL);
  const [escolaFilter, setEscolaFilter] = useState<string>(FILTER_ALL);
  const [periodoFilter, setPeriodoFilter] = useState<string>(FILTER_ALL);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const { data, isLoading, refetch } = useRenovacoesList({
    ano_destino: anoDestino,
    status: (statusFilter === FILTER_ALL || statusFilter === "sem_telefone") ? undefined : statusFilter,
    escola_id: escolaFilter === FILTER_ALL ? undefined : escolaFilter,
    periodo: periodoFilter === FILTER_ALL ? undefined : periodoFilter,
    search: searchTerm || undefined,
  });

  const updateRenovacaoMutation = useUpdateRenovacao();
  const virarAnoMutation = useVirarAnoLetivo();
  const reajusteLoteMutation = useReajusteLote();
  const atualizarStatusLoteMutation = useAtualizarStatusLoteRenovacao();

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

  const todosPassageiros = data?.passageiros || [];

  const passageirosSemTelefone = useMemo(() => {
    return todosPassageiros.filter((p) => !p.responsavel_principal?.telefone);
  }, [todosPassageiros]);

  const passageirosAptos = useMemo(() => {
    return todosPassageiros.filter((p) => Boolean(p.responsavel_principal?.telefone));
  }, [todosPassageiros]);

  const passageiros = useMemo(() => {
    if (statusFilter === "sem_telefone") {
      return passageirosSemTelefone;
    }
    return passageirosAptos;
  }, [statusFilter, passageirosSemTelefone, passageirosAptos]);

  const pendentesAptosCount = useMemo(() => {
    return passageirosAptos.filter(
      (p) => p.status === RenovacaoStatus.PENDENTE || !p.status
    ).length;
  }, [passageirosAptos]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (passageiros.length === 0) return;
    setSelectedIds((prev) => {
      if (prev.size === passageiros.length) {
        return new Set();
      }
      return new Set(passageiros.map((p) => p.passageiro_id));
    });
  }, [passageiros]);

  const selectOnlyPendentes = useCallback(() => {
    const pendentes = passageiros.filter(
      (p) => p.status === RenovacaoStatus.PENDENTE || !p.status
    );
    setSelectedIds(new Set(pendentes.map((p) => p.passageiro_id)));
  }, [passageiros]);

  const isAllSelected = useMemo(() => {
    return passageiros.length > 0 && selectedIds.size === passageiros.length;
  }, [passageiros.length, selectedIds.size]);

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

  const handleConfirmarLote = useCallback(async () => {
    if (selectedIds.size === 0 || isBatchUpdating) return;
    setIsBatchUpdating(true);

    try {
      const ids = Array.from(selectedIds);
      await atualizarStatusLoteMutation.mutateAsync({
        ano_destino: anoDestino,
        passageiro_ids: ids,
        status: RenovacaoStatus.CONFIRMADO,
      });
      toast.success(`${ids.length} vaga(s) confirmada(s) com sucesso!`);
      clearSelection();
    } catch {
      toast.error("Ocorreu um erro ao confirmar as vagas em lote.");
    } finally {
      setIsBatchUpdating(false);
    }
  }, [selectedIds, isBatchUpdating, anoDestino, atualizarStatusLoteMutation, clearSelection]);

  const handleRegistrarSaidaLote = useCallback(async () => {
    if (selectedIds.size === 0 || isBatchUpdating) return;
    setIsBatchUpdating(true);

    try {
      const ids = Array.from(selectedIds);
      await atualizarStatusLoteMutation.mutateAsync({
        ano_destino: anoDestino,
        passageiro_ids: ids,
        status: RenovacaoStatus.RECUSADO,
      });
      toast.success(`${ids.length} saída(s) registrada(s) com sucesso!`);
      clearSelection();
    } catch {
      toast.error("Ocorreu um erro ao registrar as saídas em lote.");
    } finally {
      setIsBatchUpdating(false);
    }
  }, [selectedIds, isBatchUpdating, anoDestino, atualizarStatusLoteMutation, clearSelection]);

  const handleUpdateValorInline = useCallback(
    async (passageiroId: string, novoValor: number) => {
      await updateRenovacaoMutation.mutateAsync({
        passageiroId,
        data: {
          ano_destino: anoDestino,
          novo_valor_cobranca: novoValor,
        },
      });
    },
    [anoDestino, updateRenovacaoMutation]
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
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    selectOnlyPendentes,
    clearSelection,
    isAllSelected,
    kpis,
    passageiros,
    todosPassageiros,
    passageirosAptos,
    passageirosSemTelefone,
    semTelefoneCount: passageirosSemTelefone.length,
    pendentesAptosCount,
    isLoading,
    refetch,
    handleConfirmarManual,
    handleRegistrarSaida,
    handleReativar,
    handleConfirmarLote,
    handleRegistrarSaidaLote,
    handleUpdateValorInline,
    virarAnoMutation,
    reajusteLoteMutation,
    isUpdating: updateRenovacaoMutation.isPending || isBatchUpdating,
  };
}
