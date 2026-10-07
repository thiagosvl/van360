import { useMemo } from "react";
import {
  useFretamentosListQuery,
  useFretamentoResumoQuery,
  useDeletarFretamentoMutation,
} from "@/hooks/api/useFretamentosApi";
import { useFretamentoCalculations } from "@/hooks/business/useFretamentoCalculations";
import { useFilters } from "@/hooks/ui/useFilters";
import type { FretamentoTipo, FretamentoStatus } from "@/services/api/fretamento.api";
import { FilterDefaults } from "@/types/enums";
import { getNowBR } from "@/utils/dateUtils";
import { toast } from "sonner";

export type FretamentoTipoFiltro = FretamentoTipo | FilterDefaults.TODOS;
export type FretamentoStatusFiltro = FretamentoStatus | FilterDefaults.TODOS;

export const useFretamentoViewModel = () => {
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedStatus: rawStatus,
    setSelectedStatus,
    selectedTipo: rawTipo,
    setSelectedTipo,
    selectedVeiculo: veiculoFiltro = FilterDefaults.TODOS,
    setSelectedVeiculo,
    selectedMes: mes = getNowBR().getMonth() + 1,
    selectedAno: ano = getNowBR().getFullYear(),
    setFilters,
    clearFilters,
    hasActiveFilters,
  } = useFilters({
    searchParam: "search",
    tipoParam: "tipo",
    statusParam: "status",
    veiculoParam: "veiculo",
    mesParam: "mes",
    anoParam: "ano",
  });

  const tipoFiltro = (rawTipo || FilterDefaults.TODOS) as FretamentoTipoFiltro;
  const statusFiltro = (rawStatus || FilterDefaults.TODOS) as FretamentoStatusFiltro;

  const setTipoFiltro = (val: FretamentoTipoFiltro) => setSelectedTipo?.(val);
  const setStatusFiltro = (val: FretamentoStatusFiltro) => setSelectedStatus(val);
  const setVeiculoFiltro = (val: string) => setSelectedVeiculo?.(val);

  const setMes = (novoMes: number) => setFilters({ mes: novoMes });
  const setAno = (novoAno: number) => setFilters({ ano: novoAno });
  const setMesAno = (novoMes: number, novoAno: number) => setFilters({ mes: novoMes, ano: novoAno });

  const tipoParam = tipoFiltro === FilterDefaults.TODOS ? undefined : tipoFiltro;
  const statusParam = statusFiltro === FilterDefaults.TODOS ? undefined : statusFiltro;

  const {
    data: itens,
    isLoading: isLoadingList,
    refetch: refetchList,
  } = useFretamentosListQuery(mes, ano, tipoParam, statusParam);

  const {
    data: resumo,
    isLoading: isLoadingResumo,
  } = useFretamentoResumoQuery(mes, ano);

  const deletarMutation = useDeletarFretamentoMutation();

  const { itensCalculados, totais } = useFretamentoCalculations(itens || [], resumo);

  const itensFiltrados = useMemo(() => {
    let result = itensCalculados;

    if (veiculoFiltro !== FilterDefaults.TODOS) {
      result = result.filter((item) =>
        item.veiculos.some((v) => v.veiculo_id === veiculoFiltro)
      );
    }

    const effectiveSearch = (debouncedSearchTerm || searchTerm).trim().toLowerCase();
    if (effectiveSearch) {
      result = result.filter((item) => {
        const matchTitulo = item.titulo.toLowerCase().includes(effectiveSearch);
        const matchDestino = item.destino.toLowerCase().includes(effectiveSearch);
        const matchContratante = item.contratante_nome?.toLowerCase().includes(effectiveSearch);
        return matchTitulo || matchDestino || matchContratante;
      });
    }

    return result;
  }, [itensCalculados, veiculoFiltro, debouncedSearchTerm, searchTerm]);

  const onApplyFilters = (filters: { tipo: FretamentoTipoFiltro; status: FretamentoStatusFiltro; veiculo: string }) => {
    setFilters({
      tipo: filters.tipo,
      status: filters.status,
      veiculo: filters.veiculo,
    });
  };

  const avancarMes = () => {
    if (mes === 12) {
      setMesAno(1, ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const retrocederMes = () => {
    if (mes === 1) {
      setMesAno(12, ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const excluirRegistro = async (id: string, titulo: string) => {
    try {
      await deletarMutation.mutateAsync(id);
      toast.success(`"${titulo}" removido com sucesso.`);
    } catch {
      toast.error("Erro ao remover registro. Tente novamente.");
    }
  };

  return {
    mes,
    ano,
    setMes,
    setAno,
    setMesAno,
    avancarMes,
    retrocederMes,
    searchTerm,
    setSearchTerm,
    tipoFiltro,
    setTipoFiltro,
    statusFiltro,
    setStatusFiltro,
    veiculoFiltro,
    setVeiculoFiltro,
    hasActiveFilters,
    clearFilters,
    onApplyFilters,
    itens: itensFiltrados,
    totais,
    isLoading: isLoadingList || isLoadingResumo,
    isDeleting: deletarMutation.isPending,
    refetchList,
    excluirRegistro,
  };
};
