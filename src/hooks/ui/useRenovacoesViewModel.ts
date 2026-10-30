import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useRenovacoesList,
  useUpdateRenovacao,
  useReajusteLote,
  useAtualizarStatusLoteRenovacao,
} from "../api/useRenovacoes";
import { useDebounce } from "@/hooks";
import { RenovacaoStatus, FilterDefaults } from "@/types/enums";
import { toast } from "sonner";
import { getDefaultAnoDestino } from "@/utils/domain/renovacao/renovacaoDisponibilidade";

export const FILTER_ALL = "all";

export function useRenovacoesViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [anoDestino, setAnoDestinoState] = useState<number>(() => {
    const paramAno = Number(searchParams.get("ano"));
    if (paramAno && paramAno >= 2020 && paramAno <= 2100) {
      return paramAno;
    }
    return getDefaultAnoDestino();
  });

  const setAnoDestino = useCallback(
    (novoAno: number) => {
      setAnoDestinoState(novoAno);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("ano", String(novoAno));
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const [statusFilter, setStatusFilterState] = useState<string>(() => searchParams.get("status") || FILTER_ALL);
  const [escolaFilter, setEscolaFilterState] = useState<string>(() => searchParams.get("escola") || FILTER_ALL);
  const [periodoFilter, setPeriodoFilterState] = useState<string>(() => searchParams.get("periodo") || FILTER_ALL);
  const [searchTerm, setSearchTermState] = useState<string>(() => searchParams.get("search") || "");

  const setSearchTerm = useCallback(
    (novoTermo: string) => {
      setSearchTermState(novoTermo);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (novoTermo && novoTermo.trim()) {
          next.set("search", novoTermo);
        } else {
          next.delete("search");
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setStatusFilter = useCallback(
    (novoStatus: string) => {
      setStatusFilterState(novoStatus);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (novoStatus && novoStatus !== FILTER_ALL) {
          next.set("status", novoStatus);
        } else {
          next.delete("status");
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setEscolaFilter = useCallback(
    (novaEscola: string) => {
      setEscolaFilterState(novaEscola);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (novaEscola && novaEscola !== FILTER_ALL && novaEscola !== FilterDefaults.TODAS) {
          next.set("escola", novaEscola);
        } else {
          next.delete("escola");
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setPeriodoFilter = useCallback(
    (novoPeriodo: string) => {
      setPeriodoFilterState(novoPeriodo);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (novoPeriodo && novoPeriodo !== FILTER_ALL && novoPeriodo !== FilterDefaults.TODOS) {
          next.set("periodo", novoPeriodo);
        } else {
          next.delete("periodo");
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const applyFilters = useCallback(
    (filters: { escola?: string; periodo?: string; status?: string }) => {
      if (filters.escola !== undefined) setEscolaFilterState(filters.escola);
      if (filters.periodo !== undefined) setPeriodoFilterState(filters.periodo);
      if (filters.status !== undefined) setStatusFilterState(filters.status);

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (filters.escola !== undefined) {
          if (filters.escola && filters.escola !== FILTER_ALL && filters.escola !== FilterDefaults.TODAS) {
            next.set("escola", filters.escola);
          } else {
            next.delete("escola");
          }
        }
        if (filters.periodo !== undefined) {
          if (filters.periodo && filters.periodo !== FILTER_ALL && filters.periodo !== FilterDefaults.TODOS) {
            next.set("periodo", filters.periodo);
          } else {
            next.delete("periodo");
          }
        }
        if (filters.status !== undefined) {
          if (filters.status && filters.status !== FILTER_ALL) {
            next.set("status", filters.status);
          } else {
            next.delete("status");
          }
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setEscolaFilterState(FILTER_ALL);
    setPeriodoFilterState(FILTER_ALL);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("escola");
      next.delete("periodo");
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const paramSearch = searchParams.get("search") || "";
    if (paramSearch !== searchTerm) {
      setSearchTermState(paramSearch);
    }

    const paramStatus = searchParams.get("status") || FILTER_ALL;
    if (paramStatus !== statusFilter) {
      setStatusFilterState(paramStatus);
    }

    const paramEscola = searchParams.get("escola") || FILTER_ALL;
    if (paramEscola !== escolaFilter) {
      setEscolaFilterState(paramEscola);
    }

    const paramPeriodo = searchParams.get("periodo") || FILTER_ALL;
    if (paramPeriodo !== periodoFilter) {
      setPeriodoFilterState(paramPeriodo);
    }
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 350);

  const effectiveSearch = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed.length === 1) return undefined;
    return trimmed || undefined;
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, refetch } = useRenovacoesList({
    ano_destino: anoDestino,
    status: (statusFilter === FILTER_ALL || statusFilter === "sem_telefone") ? undefined : statusFilter,
    escola_id: escolaFilter === FILTER_ALL ? undefined : escolaFilter,
    periodo: periodoFilter === FILTER_ALL ? undefined : periodoFilter,
    search: effectiveSearch,
  });

  const updateRenovacaoMutation = useUpdateRenovacao();
  const reajusteLoteMutation = useReajusteLote();
  const atualizarStatusLoteMutation = useAtualizarStatusLoteRenovacao();



  const kpis = useMemo(() => {
    const rawKpis = data?.kpis;
    const faturamentoConfirmado = rawKpis?.faturamento_confirmado ?? (
      data?.passageiros
        ? data.passageiros
            .filter((p) => p.status === RenovacaoStatus.CONFIRMADO)
            .reduce((acc, p) => acc + (p.novo_valor_cobranca || 0), 0)
        : 0
    );

    return {
      faturamento_atual: rawKpis?.faturamento_atual || 0,
      faturamento_projetado: rawKpis?.faturamento_projetado || 0,
      faturamento_confirmado: faturamentoConfirmado,
      percentual_crescimento: rawKpis?.percentual_crescimento || 0,
      contadores: rawKpis?.contadores || {
        total_ativos: 0,
        confirmados: 0,
        pendentes: 0,
        nao_notificados: 0,
        saidas: 0,
      },
    };
  }, [data?.kpis, data?.passageiros]);

  const todosPassageiros = useMemo(() => {
    const list = data?.passageiros ? [...data.passageiros] : [];
    return list.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" }));
  }, [data?.passageiros]);

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

  const handleReativarLote = useCallback(async () => {
    if (selectedIds.size === 0 || isBatchUpdating) return;
    setIsBatchUpdating(true);

    try {
      const ids = Array.from(selectedIds);
      await atualizarStatusLoteMutation.mutateAsync({
        ano_destino: anoDestino,
        passageiro_ids: ids,
        status: RenovacaoStatus.PENDENTE,
      });
      toast.success(`${ids.length} aluno(s) redefinido(s) para Pendente!`);
      clearSelection();
    } catch {
      toast.error("Ocorreu um erro ao redefinir status em lote.");
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
    applyFilters,
    clearFilters,
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
    periodoConfig: data?.periodo_config,
    isLoading,
    isFetching,
    hasData: Boolean(data),
    refetch,
    handleConfirmarManual,
    handleRegistrarSaida,
    handleReativar,
    handleConfirmarLote,
    handleRegistrarSaidaLote,
    handleReativarLote,
    handleUpdateValorInline,
    reajusteLoteMutation,
    isUpdating: updateRenovacaoMutation.isPending || isBatchUpdating,
  };
}
