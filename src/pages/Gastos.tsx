// React
import { useCallback, useEffect, useState } from "react";

// Third-party
import { toast } from "@/utils/notifications/toast";

// Components - Alerts

// Components - UI
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - Common
import { BlurredValue } from "@/components/common/BlurredValue";
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";

// Components - Features
import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";

// Components - Dialogs
import { ContextualUpsellDialog } from "@/components/dialogs/ContextualUpsellDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto, useFilters, useGastos, useVeiculos } from "@/hooks";
import { useAccessControl } from "@/hooks/business/useAccessControl"; // NEW
import { useGastosCalculations } from "@/hooks/business/useGastosCalculations"; // NEW

// Utils
import { PLANO_ESSENCIAL } from "@/constants";
import { cn } from "@/lib/utils";
// import { enablePageActions } from "@/utils/domain/pages/pagesUtils"; // DEPRECATED

// Types
import { CATEGORIAS_GASTOS, Gasto } from "@/types/gasto";

// Icons
import { UpgradeStickyFooter } from "@/components/common/UpgradeStickyFooter";
import {
  CalendarIcon,
  Lock,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function Gastos() {
  const { setPageTitle, openPlanosDialog } = useLayout();
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
    setFilters,
  } = useFilters({
    mesParam: "mes",
    anoParam: "ano",
    categoriaParam: "categoria",
    veiculoParam: "veiculo",
    searchParam: "search",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  
  // Authorization Hook
  const { profile, isLoading: isAuthLoading, permissions } = useAccessControl();
  const enabledPageActions = permissions.canViewGastos;
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
      enabled: !!profile?.id && enabledPageActions,
      onError: () => toast.error("gasto.erro.carregar"),
    }
  );

  const { data: veiculosData } = useVeiculos(profile?.id, {
    enabled: !!profile?.id,
  });
  const veiculos = veiculosData?.list || [];

  // Calculation Hook
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

  const openDialog = useCallback((gasto: Gasto | null = null) => {
    setEditingGasto(gasto);
    setIsDialogOpen(true);
  }, []);

  const pullToRefreshReload = async () => {
    await refetchGastos();
  };

  const loading = isGastosLoading || isGastosFetching;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div>
          <div className="space-y-6 md:space-y-8">
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
                    value={displayData.totalGasto}
                    visible={enabledPageActions}
                    type="currency"
                  />
                }
                count={displayData.gastosFiltrados.length}
                icon={TrendingDown}
                bgClass="bg-red-50"
                colorClass="text-red-600"
                countLabel="Registro"
                className="col-span-2 md:col-span-1"
                countVisible={enabledPageActions}
              />

              <div className="bg-white p-2 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px]">
                <div className="h-5 w-5 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 bg-orange-50">
                  <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Categoria
                  </p>
                  <p className="font-bold text-gray-900 leading-tight max-w-[140px]">
                    <BlurredValue
                      value={displayData.principalCategoriaData?.name}
                      visible={enabledPageActions}
                      type="text"
                      className={cn(
                        enabledPageActions
                          ? displayData.principalCategoriaData?.name?.length >=
                            12
                            ? "text-xs sm:text-lg"
                            : "text-base sm:text-lg"
                          : "text-sm"
                      )}
                    />
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {displayData.principalCategoriaData ? (
                      <BlurredValue
                        value={displayData.principalCategoriaData.percentage}
                        visible={enabledPageActions}
                        type="percent"
                      />
                    ) : (
                      "0% do total"
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white p-2 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px]">
                <div className="h-5 w-5 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                  <CalendarIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Média Diária
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    <BlurredValue
                      value={displayData.mediaDiaria}
                      visible={enabledPageActions}
                      type="currency"
                    />
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    <BlurredValue
                      value="por dia"
                      visible={enabledPageActions}
                      type="text"
                    />
                  </p>
                </div>
              </div>
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
                      : setIsUpgradeDialogOpen(true)
                  }
                  categorias={CATEGORIAS_GASTOS}
                  veiculos={veiculos.map((v) => ({ id: v.id, placa: v.placa }))}
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
                      !enabledPageActions && "pb-32 md:pb-0"
                    )}
                  >
                    {!enabledPageActions && !loading && (
                      <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-orange-800 font-medium">
                        <Lock className="w-4 h-4" />
                        <span>Os registros abaixo são demonstrativos</span>
                      </div>
                    )}

                    <GastosList
                      gastos={displayData.gastosFiltrados}
                      onEdit={openDialog}
                      onDelete={handleDelete}
                      isRestricted={!enabledPageActions}
                      veiculos={veiculos.map((v) => ({
                        id: v.id,
                        placa: v.placa,
                      }))}
                    />

                    {!enabledPageActions && (
                      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/90 to-white z-10 hidden md:flex flex-col items-center justify-end pb-10">
                        <div className="flex flex-col items-center text-center max-w-md px-4 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                          <div className="bg-orange-100 rounded-full p-4 mb-4 shadow-sm">
                            <Lock className="w-8 h-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Para onde está indo seu dinheiro?
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Não deixe o lucro escapar pelo ralo. Controle
                            combustível e manutenção com precisão para saber seu
                            lucro real.
                          </p>
                          <Button
                            onClick={() =>
                              (window.location.href = "/planos?plano=essencial")
                            }
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12 px-8 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:-translate-y-0.5"
                          >
                            Quero controlar meus gastos
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

          <GastoFormDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            gastoToEdit={editingGasto}
            veiculos={veiculos.map((v) => ({ id: v.id, placa: v.placa }))}
            usuarioId={profile?.id}
            onSuccess={() => {
              // Optional: Refetch or show success message if needed
            }}
          />

          <ContextualUpsellDialog
            open={isUpgradeDialogOpen}
            onOpenChange={setIsUpgradeDialogOpen}
            feature="controle_gastos"
            targetPlan={PLANO_ESSENCIAL}
            onViewAllPlans={() => {
              setIsUpgradeDialogOpen(false);
              openPlanosDialog();
            }}
            onSuccess={() => {
              // Ao confirmar pagamento, forçamos recarregamento de permissões
              window.location.reload();
            }}
          />
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />

      {/* Mobile Sticky Footer for No Access */}
      <UpgradeStickyFooter
        visible={!enabledPageActions}
        title="Visualize seus dados reais."
        description="Libere o acesso agora."
        buttonText="Ver Planos"
        onAction={() => setIsUpgradeDialogOpen(true)}
      />
    </>
  );
}
