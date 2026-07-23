import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto, useFilters, useGastos, useVeiculos, safeCloseDialog, useGastoCategorias } from "@/hooks";
import { useGastosCalculations } from "@/hooks/business/useGastosCalculations";
import { useProfile } from "@/hooks/business/useProfile";
import { FilterDefaults } from "@/types/enums";
import { Gasto } from "@/types/gasto";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useState, useMemo } from "react";
import { getNowBR } from "@/utils/dateUtils";

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
    selectedMes: mesFilter = getNowBR().getMonth() + 1,
    setSelectedMes,
    selectedAno: anoFilter = getNowBR().getFullYear(),
    setSelectedAno,
    selectedCategoria: categoriaFilter = FilterDefaults.TODAS,
    setSelectedCategoria,
    selectedVeiculo: veiculoFilter = FilterDefaults.TODOS,
    setSelectedVeiculo,
    setFilters,
    hasActiveFilters,
  } = useFilters({
    mesParam: "mes",
    anoParam: "ano",
    categoriaParam: "categoria",
    veiculoParam: "veiculo",
  });

  const {
    data: gastosRes,
    isLoading: isGastosLoading,
    isFetching: isGastosFetching,
    refetch: refetchGastos,
  } = useGastos(
    {
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
      categoria: categoriaFilter !== FilterDefaults.TODAS ? categoriaFilter : undefined,
      veiculoId: veiculoFilter !== FilterDefaults.TODOS ? veiculoFilter : undefined,
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("gasto.erro.carregar"),
    }
  );

  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id }, {
    enabled: !!profile?.id,
  });

  const { data: categoriasData } = useGastoCategorias({
    enabled: !!profile?.id,
  });

  const veiculos = useMemo(() => veiculosData?.list || [], [veiculosData]);
  const veiculosDropdown = useMemo(() => veiculos.map((v) => ({ id: v.id, placa: v.placa })), [veiculos]);
  const categoriasDropdown = useMemo(() => categoriasData?.map((c) => c.slug) || [], [categoriasData]);

  const gastos = gastosRes?.list || [];

  const displayData = useGastosCalculations({
    gastos,
    mesFilter,
    anoFilter,
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
      categoria: FilterDefaults.TODAS,
      veiculo: FilterDefaults.TODOS,
    });
  }, [setFilters]);

  return {
    profile,
    isProfileLoading,
    mesFilter,
    anoFilter,
    categoriaFilter,
    veiculoFilter,
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
    categorias: categoriasDropdown,
    clearFilters,
    hasActiveFilters,
  };
}
