import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto, useFilters, useGastos, useVeiculos, useGastoCategorias } from "@/hooks";
import { isRecentLocalGastoMutation, debounceRealtimeGastoSync } from "@/hooks/api/useGastoMutations";
import { useGastosCalculations } from "@/hooks/business/useGastosCalculations";
import { useProfile } from "@/hooks/business/useProfile";
import { FilterDefaults, GastoEscopoAcao } from "@/types/enums";
import { Gasto } from "@/types/gasto";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useState, useMemo } from "react";
import { getNowBR } from "@/utils/dateUtils";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGastosViewModel() {
  const queryClient = useQueryClient();
  const { can, isSubConta } = usePermissions();
  const {
    setPageTitle,
    openGastoFormDialog,
  } = useLayout();

  const {
    isLoading: isProfileLoading,
    profile,
    donoContaId,
  } = useProfile();

  const deleteGasto = useDeleteGasto();
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);

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

  const gastosFilters = useMemo(
    () => ({
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
      categoria: categoriaFilter !== FilterDefaults.TODAS ? categoriaFilter : undefined,
      veiculoId:
        veiculoFilter !== FilterDefaults.TODOS
          ? veiculoFilter
          : isSubConta && profile?.veiculo_id
            ? profile.veiculo_id
            : undefined,
    }),
    [
      profile?.id,
      profile?.veiculo_id,
      mesFilter,
      anoFilter,
      categoriaFilter,
      veiculoFilter,
      isSubConta,
    ]
  );

  const {
    data: gastosRes,
    isLoading: isGastosLoading,
    isFetching: isGastosFetching,
    refetch: refetchGastos,
  } = useGastos(gastosFilters, {
    enabled: !!profile?.id && can("gastos.visualizar"),
    onError: () => toast.error("gasto.erro.carregar"),
  });

  const veiculosFilters = useMemo(
    () => ({ usuarioId: profile?.id }),
    [profile?.id]
  );

  const { data: veiculosData } = useVeiculos(veiculosFilters, {
    enabled: !!profile?.id && can("veiculos.gerenciar"),
  });

  const { data: categoriasData } = useGastoCategorias({
    enabled: !!profile?.id && can("gastos.visualizar"),
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

  const userVeiculoId = profile?.veiculo_id;

  // Supabase Realtime Sync para a Lista de Gastos
  useEffect(() => {
    if (!profile?.id || !can("gastos.visualizar") || !donoContaId) return;

    const isEventForThisDevice = (payloadData: any) => {
      // Se o evento possuir donoContaId e for de outra conta, ignora
      if (payloadData?.donoContaId && payloadData.donoContaId !== donoContaId) {
        return false;
      }

      if (!isSubConta) return true;
      if (!userVeiculoId) return true;

      const gastoVeiculoId = payloadData?.veiculo_id || payloadData?.veiculoId;
      if (!gastoVeiculoId) return true;
      return gastoVeiculoId === userVeiculoId;
    };

    const triggerGastosSync = (eventMes?: number, eventAno?: number) => {
      if (isRecentLocalGastoMutation()) return;

      // Se o evento informar mês/ano e for de um mês/ano diferente do atualmente aberto na tela:
      if (eventMes && eventAno && (eventMes !== mesFilter || eventAno !== anoFilter)) {
        // Marca o cache desatualizado sem forçar refetch nem piscar a tela do mês atual
        queryClient.invalidateQueries({
          queryKey: ["gastos"],
          refetchType: "none",
        });
        return;
      }

      // Se for para o mesmo mês/ano que o usuário está visualizando na tela:
      debounceRealtimeGastoSync("gastos-page-sync", () => {
        queryClient.invalidateQueries({ queryKey: ["gastos"], refetchType: "active" });
      });
    };

    const channel = supabase
      .channel("van360-fleet-sync")
      .on("broadcast", { event: "gasto_changed" }, (payload: any) => {
        const payloadData = payload?.payload || payload;
        if (isEventForThisDevice(payloadData)) {
          triggerGastosSync(payloadData?.mes, payloadData?.ano);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "gastos" }, (payload: any) => {
        const payloadData = payload?.new || payload?.old || {};
        if (isEventForThisDevice(payloadData)) {
          let eventMes: number | undefined;
          let eventAno: number | undefined;
          const dataStr = payloadData?.data;
          if (dataStr) {
            const d = new Date(dataStr);
            if (!isNaN(d.getTime())) {
              eventMes = d.getMonth() + 1;
              eventAno = d.getFullYear();
            }
          }
          triggerGastosSync(eventMes, eventAno);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, profile?.id, donoContaId, isSubConta, userVeiculoId, can, mesFilter, anoFilter]);

  const handleDelete = useCallback(
    (id: string) => {
      const target = gastos.find((g) => g.id === id);
      if (target) {
        setGastoToDelete(target);
      }
    },
    [gastos]
  );

  const confirmDelete = useCallback(
    async (escopo: GastoEscopoAcao) => {
      if (!gastoToDelete) return;
      try {
        await deleteGasto.mutateAsync({ id: gastoToDelete.id, escopo });
        setGastoToDelete(null);
      } catch (error) {
        setGastoToDelete(null);
      }
    },
    [deleteGasto, gastoToDelete]
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
    gastoToDelete,
    setGastoToDelete,
    confirmDelete,
    handleRefresh,
    handleDelete,
    handleOpenForm,
    veiculos: veiculosDropdown,
    categorias: categoriasDropdown,
    clearFilters,
    hasActiveFilters,
  };
}
