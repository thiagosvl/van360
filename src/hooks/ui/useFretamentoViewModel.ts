import { useState, useMemo } from "react";
import {
  useFretamentosListQuery,
  useFretamentoResumoQuery,
  useDeletarFretamentoMutation,
} from "@/hooks/api/useFretamentosApi";
import { useFretamentoCalculations } from "@/hooks/business/useFretamentoCalculations";
import type { FretamentoTipo, FretamentoStatus } from "@/services/api/fretamento.api";
import { FilterDefaults } from "@/types/enums";
import { toast } from "sonner";

export type FretamentoTipoFiltro = FretamentoTipo | FilterDefaults.TODOS;
export type FretamentoStatusFiltro = FretamentoStatus | FilterDefaults.TODOS;

export const useFretamentoViewModel = () => {
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [ano, setAno] = useState<number>(currentDate.getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState<FretamentoTipoFiltro>(FilterDefaults.TODOS);
  const [statusFiltro, setStatusFiltro] = useState<FretamentoStatusFiltro>(FilterDefaults.TODOS);
  const [veiculoFiltro, setVeiculoFiltro] = useState<string>(FilterDefaults.TODOS);

  const [searchTerm, setSearchTerm] = useState<string>("");

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

    if (searchTerm.trim()) {
      const termo = searchTerm.trim().toLowerCase();
      result = result.filter((item) => {
        const matchTitulo = item.titulo.toLowerCase().includes(termo);
        const matchDestino = item.destino.toLowerCase().includes(termo);
        const matchContratante = item.contratante_nome?.toLowerCase().includes(termo);
        return matchTitulo || matchDestino || matchContratante;
      });
    }

    return result;
  }, [itensCalculados, veiculoFiltro, searchTerm]);

  const hasActiveFilters = useMemo(() => {
    return (
      tipoFiltro !== FilterDefaults.TODOS ||
      statusFiltro !== FilterDefaults.TODOS ||
      veiculoFiltro !== FilterDefaults.TODOS ||
      searchTerm.trim().length > 0
    );
  }, [tipoFiltro, statusFiltro, veiculoFiltro, searchTerm]);

  const clearFilters = () => {
    setTipoFiltro(FilterDefaults.TODOS);
    setStatusFiltro(FilterDefaults.TODOS);
    setVeiculoFiltro(FilterDefaults.TODOS);
    setSearchTerm("");
  };

  const onApplyFilters = (filters: { tipo: FretamentoTipoFiltro; status: FretamentoStatusFiltro; veiculo: string }) => {
    setTipoFiltro(filters.tipo);
    setStatusFiltro(filters.status);
    setVeiculoFiltro(filters.veiculo);
  };

  const avancarMes = () => {
    if (mes === 12) {
      setMes(1);
      setAno((prev) => prev + 1);
    } else {
      setMes((prev) => prev + 1);
    }
  };

  const retrocederMes = () => {
    if (mes === 1) {
      setMes(12);
      setAno((prev) => prev - 1);
    } else {
      setMes((prev) => prev - 1);
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
