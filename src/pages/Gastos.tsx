import { useCallback, useEffect } from "react";

import { toast } from "@/utils/notifications/toast";

import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

import { BlurredValue } from "@/components/common/BlurredValue";
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";

import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";

import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto, useFilters, useGastos, useVeiculos } from "@/hooks";
import { useGastosCalculations } from "@/hooks/business/useGastosCalculations"; // NEW
import { usePermissions } from "@/hooks/business/usePermissions";

import { FEATURE_GASTOS, PLANO_ESSENCIAL } from "@/constants";
import { cn } from "@/lib/utils";
import {
  MOCK_DATA_NO_ACCESS_GASTOS,
  MOCK_VEICULOS,
} from "@/utils/mocks/restrictedData";

import { CATEGORIAS_GASTOS, Gasto } from "@/types/gasto";

import { UpgradeStickyFooter } from "@/components/common/UpgradeStickyFooter";
import {
  CalendarIcon,
  Lock,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function Gastos() {
  const { setPageTitle, openPlanUpgradeDialog, openGastoFormDialog } =
    useLayout();
  const deleteGasto = useDeleteGasto();

  const isActionLoading = deleteGasto.isPending;

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
  } = useFilters({
    mesParam: "mes",
    anoParam: "ano",
    categoriaParam: "categoria",
    veiculoParam: "veiculo",
    searchParam: "search",
  });

  const {
    profile,
    isLoading: isAuthLoading,
    canViewModuleGastos,
  } = usePermissions();
  const enabledPageActions = canViewModuleGastos;
  const loadingActions = isAuthLoading;

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
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("gasto.erro.carregar"),
    }
  );

  const { data: veiculosData } = useVeiculos(profile?.id, {
    enabled: !!profile?.id,
  });
  const veiculos = veiculosData?.list || [];

  const displayData = useGastosCalculations({
    gastos,
    mesFilter,
    anoFilter,
    searchTerm,
    enabledPageActions,
    loadingActions,
  });

  useEffect(() => {
    setPageTitle("Controle de Gastos");
  }, [setPageTitle]);

  const handleDelete = useCallback(
    async (id: string) => {
      deleteGasto.mutate(id);
    },
    [deleteGasto]
  );

  const openDialog = useCallback(
    (gasto: Gasto | null = null) => {
      openGastoFormDialog({
        gastoToEdit: gasto,
        veiculos: veiculos.map((v) => ({ id: v.id, placa: v.placa })),
        usuarioId: profile?.id,
        onSuccess: refetchGastos,
      });
    },
    [openGastoFormDialog, veiculos, profile?.id, refetchGastos]
  );

  const pullToRefreshReload = async () => {
    if (!enabledPageActions) return;
    await refetchGastos();
  };

  const loading = isGastosLoading || isGastosFetching;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div>
          <div className="space-y-6 md:space-y-8">
            {/* Banner Modo Demo */}
            {!enabledPageActions && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-200 p-1.5 rounded-full shrink-0">
                    <Lock className="w-3.5 h-3.5 text-orange-700" />
                  </div>
                  <span className="text-sm text-orange-900 font-semibold leading-tight">
                    Dados de exemplo para demonstração
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider shrink-0 whitespace-nowrap ml-4">
                  MODO DEMO
                </span>
              </div>
            )}

            {/* 1. Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <DateNavigation
                mes={mesFilter}
                ano={anoFilter}
                onNavigate={(m, a) => {
                  if (setSelectedMes) setSelectedMes(m);
                  if (setSelectedAno) setSelectedAno(a);
                }}
                disabled={!enabledPageActions}
              />
            </div>

            {/* 2. KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <KPICard
                title="Gasto Total"
                value={
                  <BlurredValue
                    value={
                      enabledPageActions
                        ? displayData.totalGasto
                        : MOCK_DATA_NO_ACCESS_GASTOS.totalGasto
                    }
                    visible={true} // Sempre visível (Real ou Demo)
                    type="currency"
                  />
                }
                count={
                  enabledPageActions
                    ? displayData.gastosFiltrados.length
                    : MOCK_DATA_NO_ACCESS_GASTOS.gastos.length
                }
                icon={TrendingDown}
                bgClass="bg-red-50"
                colorClass="text-red-600"
                countLabel="Registro"
                className="col-span-2 md:col-span-1"
                countVisible={true}
              />

              <KPICard
                title="Top Categoria"
                value={
                  <BlurredValue
                    value={
                      enabledPageActions
                        ? displayData.principalCategoriaData?.name || "-"
                        : MOCK_DATA_NO_ACCESS_GASTOS.principalCategoriaData.name
                    }
                    visible={true}
                    type="text"
                    className={cn(
                      (
                        enabledPageActions
                          ? displayData.principalCategoriaData?.name?.length >=
                            12
                          : false
                      )
                        ? "text-xs sm:text-lg"
                        : "text-base sm:text-lg",
                      "font-bold"
                    )}
                  />
                }
                icon={TrendingUp}
                bgClass="bg-orange-50"
                colorClass="text-orange-600"
                countText={
                  enabledPageActions ? (
                    displayData.principalCategoriaData ? (
                      <BlurredValue
                        value={displayData.principalCategoriaData.percentage}
                        visible={true}
                        type="percent"
                      />
                    ) : (
                      "0% do total"
                    )
                  ) : (
                    `${MOCK_DATA_NO_ACCESS_GASTOS.principalCategoriaData.percentage}% do total`
                  )
                }
                countVisible={true}
              />

              <KPICard
                title="Média Diária"
                value={
                  <BlurredValue
                    value={
                      enabledPageActions
                        ? displayData.mediaDiaria
                        : MOCK_DATA_NO_ACCESS_GASTOS.mediaDiaria
                    }
                    visible={true}
                    type="currency"
                  />
                }
                icon={CalendarIcon}
                bgClass="bg-blue-50"
                colorClass="text-blue-600"
                countText={
                  <BlurredValue value="por dia" visible={true} type="text" />
                }
                countVisible={true}
              />
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="p-0">
                {/* Toolbar is here now */}
              </CardHeader>

              <CardContent className="px-0 relative">
                <GastosToolbar
                  categoriaFilter={categoriaFilter}
                  onCategoriaChange={(val) =>
                    setSelectedCategoria && setSelectedCategoria(val)
                  }
                  veiculoFilter={veiculoFilter}
                  onVeiculoChange={(val) =>
                    setSelectedVeiculo && setSelectedVeiculo(val)
                  }
                  onRegistrarGasto={() =>
                    enabledPageActions
                      ? openDialog()
                      : openPlanUpgradeDialog({
                          feature: FEATURE_GASTOS,
                          defaultTab: PLANO_ESSENCIAL,
                        })
                  }
                  categorias={CATEGORIAS_GASTOS}
                  veiculos={
                    enabledPageActions
                      ? veiculos.map((v) => ({ id: v.id, placa: v.placa }))
                      : MOCK_VEICULOS
                  }
                  disabled={loading || loadingActions}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                {loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div
                    className={cn(
                      "relative",
                      !enabledPageActions && "pb-20 md:pb-0"
                    )}
                  >
                    <GastosList
                      gastos={
                        !enabledPageActions
                          ? (MOCK_DATA_NO_ACCESS_GASTOS.gastos as unknown as Gasto[])
                          : displayData.gastosFiltrados
                      }
                      onEdit={openDialog}
                      onDelete={handleDelete}
                      isRestricted={!enabledPageActions}
                      showVisibleValues={true} // Modo Demo: mostra valores mesmo restrito
                      veiculos={
                        enabledPageActions
                          ? veiculos.map((v) => ({
                              id: v.id,
                              placa: v.placa,
                            }))
                          : MOCK_VEICULOS
                      }
                    />

                    {!enabledPageActions && (
                      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/90 to-white z-10 hidden md:flex flex-col items-center justify-end pb-10">
                        <div className="flex flex-col items-center text-center max-w-md px-4 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                          <div className="bg-orange-100 rounded-full p-4 mb-4 shadow-sm">
                            <Lock className="w-8 h-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Quer ver seu lucro de verdade?
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Chega de adivinhar. Saiba exatamente quanto sua van
                            gasta com combustível, manutenção e salários e
                            descubra o seu lucro real.
                          </p>
                          <Button
                            onClick={() =>
                              openPlanUpgradeDialog({
                                feature: FEATURE_GASTOS,
                                defaultTab: PLANO_ESSENCIAL,
                              })
                            }
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12 px-8 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:-translate-y-0.5"
                          >
                            Liberar Acesso
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {enabledPageActions &&
                  !loading &&
                  displayData.gastosFiltrados.length === 0 && (
                    <UnifiedEmptyState
                      icon={Wallet}
                      title="Nenhum gasto encontrado"
                      description={
                        searchTerm
                          ? `Nenhum gasto encontrado para "${searchTerm}"`
                          : "Nenhum gasto registrado no mês indicado."
                      }
                      action={
                        !searchTerm
                          ? {
                              label: "Registrar Gasto",
                              onClick: () => openDialog(),
                            }
                          : undefined
                      }
                    />
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />

      {/* Mobile Sticky Footer for No Access */}
      <UpgradeStickyFooter
        visible={!enabledPageActions}
        title="Quer ver seu lucro real?"
        description="Chega de adivinhar. Libere seu acesso."
        buttonText="Liberar Acesso"
        onAction={() =>
          openPlanUpgradeDialog({
            feature: FEATURE_GASTOS,
            defaultTab: PLANO_ESSENCIAL,
          })
        }
      />
    </>
  );
}
