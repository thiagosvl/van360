import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto, useFilters, useGastos, useVeiculos, safeCloseDialog } from "@/hooks";
import { useGastosCalculations } from "@/hooks/business/useGastosCalculations";
import { useProfile } from "@/hooks/business/useProfile";
import { Gasto } from "@/types/gasto";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useState, useMemo } from "react";

export function useGastosViewModel() {
  const {
    setPageTitle,
    openGastoFormDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const {
    isLoading: isProfileLoading,
    profile,
  } = useProfile();

  const deleteGasto = useDeleteGasto();

  const {
    searchTerm,
    setSearchTerm,
    selectedMes: mesFilter = new Date().getMonth() + 1,
    setSelectedMes,
    selectedAno: anoFilter = new Date().getFullYear(),
    setSelectedAno,
    selectedCategoria: categoriaFilter = "todas",
    setSelectedCategoria,
    selectedVeiculo: veiculoFilter = "todos",
    setSelectedVeiculo,
    setFilters
  } = useFilters({
    mesParam: "mes",
    anoParam: "ano",
    categoriaParam: "categoria",
    veiculoParam: "veiculo",
    searchParam: "search",
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: gastos = [],
    isLoading: isGastosLoading,
    isFetching: isGastosFetching,
    refetch: refetchGastos,
  } = useGastos(
    {
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
      categoria: categoriaFilter !== "todas" ? categoriaFilter : undefined,
      veiculoId: veiculoFilter !== "todos" ? veiculoFilter : undefined,
      search: debouncedSearchTerm,
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("gasto.erro.carregar"),
    }
  );

  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id }, {
    enabled: !!profile?.id,
  });

  const veiculos = useMemo(() => veiculosData?.list || [], [veiculosData]);
  const veiculosDropdown = useMemo(() => veiculos.map((v) => ({ id: v.id, placa: v.placa })), [veiculos]);

  const displayData = useGastosCalculations({
    gastos,
    mesFilter,
    anoFilter,
    searchTerm,
    loadingActions: isProfileLoading,
  });

  useEffect(() => {
    setPageTitle("Gastos");
  }, [setPageTitle]);

  const handleDelete = useCallback(
    async (id: string) => {
      openConfirmationDialog({
        title: "Excluir gasto?",
        description:
          "Tem certeza que deseja excluir este registro de gasto? Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteGasto.mutateAsync(id);
            safeCloseDialog(closeConfirmationDialog);
            toast.success("Gasto excluído com sucesso");
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [openConfirmationDialog, deleteGasto, closeConfirmationDialog]
  );

  const handleOpenForm = useCallback(
    (gasto: Gasto | null = null) => {
      openGastoFormDialog({
        gastoToEdit: gasto,
        veiculos: veiculosDropdown,
        usuarioId: profile?.id,
      });
    },
    [openGastoFormDialog, veiculosDropdown, profile?.id]
  );

  const handleRefresh = async () => {
    await refetchGastos();
  };

  const clearFilters = useCallback(() => {
    setFilters({
      categoria: "todas",
      veiculo: "todos",
      search: ""
    });
    setSearchTerm("");
  }, [setFilters, setSearchTerm]);

  return {
    profile,
    isProfileLoading,
    mesFilter,
    anoFilter,
    categoriaFilter,
    veiculoFilter,
    searchTerm,
    setSearchTerm,
    setSelectedMes,
    setSelectedAno,
    setSelectedCategoria,
    setSelectedVeiculo,
    setFilters,
    gastos: displayData.gastosFiltrados,
    totalGasto: displayData.totalGasto,
    mediaDiaria: displayData.mediaDiaria,
    principalCategoriaData: displayData.principalCategoriaData,
    isLoading: isGastosLoading || isGastosFetching,
    isActionLoading: deleteGasto.isPending,
    handleRefresh,
    handleDelete,
    handleOpenForm,
    veiculos: veiculosDropdown,
    clearFilters,
  };
}
