import { DateNavigation } from "@/components/common/DateNavigation";
import GastoDeleteDialog from "@/components/dialogs/GastoDeleteDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { useGastosViewModel, safeCloseDialog, useGastoCategorias } from "@/hooks";
import { formatCurrency } from "@/utils/formatters/currency";
import { getCategoriaMetadata } from "@/utils/domain";
import { Wallet, TrendingDown, Calendar, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useTutorialsConfig } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";

export default function Gastos() {
  const { can, isMonitor } = usePermissions();
  const { config: tutorialConfig, shouldShowTutorial } = useTutorialsConfig("gastos");
  const { data: categoriasData } = useGastoCategorias();

  const {
    mesFilter,
    anoFilter,
    categoriaFilter,
    veiculoFilter,
    setSelectedCategoria,
    setSelectedVeiculo,
    setFilters,
    gastos,
    totalGasto,
    mediaDiaria,
    principalCategoriaData,
    isLoading: loading,
    handleRefresh,
    handleDelete,
    handleOpenForm,
    veiculos,
    categorias,
    hasActiveFilters,
    clearFilters,
    gastoToDelete,
    setGastoToDelete,
    confirmDelete,
    isActionLoading,
  } = useGastosViewModel();

  if (isMonitor || !can("gastos.visualizar")) {
    return <AccessRestrictedState moduleName="Gastos e Despesas" />;
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
          <DateNavigation
            mes={mesFilter}
            ano={anoFilter}
            onNavigate={(m, a) => {
              setFilters({ mes: m, ano: a });
            }}
            disabled={false}
          />

          <div className="-mx-4 px-4 py-2 sm:mx-0 sm:px-0 sm:py-0 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible touch-pan-x">
            <div className="flex items-stretch gap-2.5 sm:gap-3 w-max sm:w-full sm:grid sm:grid-cols-3">
              <div className="p-3.5 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left group shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[180px] min-w-[180px] shrink-0 sm:w-auto sm:shrink sm:min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2 min-w-0">
                  <span 
                    className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                    title="Total de Despesas"
                  >
                    Total de Despesas
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                    <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2 min-w-0">
                  {loading ? (
                    <Skeleton className="h-7 sm:h-8 w-20 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
                  ) : (
                    <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                      {formatCurrency(totalGasto)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left group shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[180px] min-w-[180px] shrink-0 sm:w-auto sm:shrink sm:min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2 min-w-0">
                  <span 
                    className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                    title="Média Diária"
                  >
                    Média Diária
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2 min-w-0">
                  {loading ? (
                    <Skeleton className="h-7 sm:h-8 w-16 sm:w-24 rounded-[10px] bg-[#f5f5f5]" />
                  ) : (
                    <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                      {formatCurrency(mediaDiaria)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left group shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[180px] min-w-[180px] shrink-0 sm:w-auto sm:shrink sm:min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2 min-w-0">
                  <span 
                    className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                    title="Maior Gasto"
                  >
                    Maior Gasto
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                    <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2 min-w-0">
                  {loading ? (
                    <Skeleton className="h-7 sm:h-8 w-20 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
                  ) : (
                    <>
                      <span
                        className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate"
                        title={
                          principalCategoriaData?.name
                            ? getCategoriaMetadata(principalCategoriaData.name, categoriasData).label
                            : undefined
                        }
                      >
                        {principalCategoriaData?.name
                          ? getCategoriaMetadata(principalCategoriaData.name, categoriasData).label
                          : "—"}
                      </span>
                      {principalCategoriaData && (
                        <span className="text-xs font-medium text-[#737373] shrink-0">
                          {Math.round(principalCategoriaData.percentage)}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <GastosToolbar
            categoriaFilter={categoriaFilter}
            onCategoriaChange={(val) => setSelectedCategoria(val)}
            veiculoFilter={veiculoFilter}
            onVeiculoChange={(val) => setSelectedVeiculo(val)}
            onApplyFilters={(filters) => {
              setFilters({
                categoria: filters.categoria,
                veiculo: filters.veiculo,
              });
            }}
            onRegistrarGasto={() => {
              if (can("gastos.criar")) handleOpenForm();
            }}
            disabled={!can("gastos.criar")}
            categorias={categorias}
            veiculos={veiculos}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {loading ? (
            <ListSkeleton count={5} />
          ) : (
            <div className="relative">
              <GastosList
                gastos={gastos}
                onEdit={handleOpenForm}
                onDelete={handleDelete}
                veiculos={veiculos}
              />

              {!loading && gastos.length === 0 && (
                <UnifiedEmptyState
                  icon={Wallet}
                  title={
                    hasActiveFilters
                      ? "Nenhum gasto encontrado"
                      : "Nenhum gasto registrado"
                  }
                  description={
                    hasActiveFilters
                      ? "Não encontramos gastos com os filtros selecionados."
                      : "Nenhum gasto registrado no mês indicado."
                  }
                  action={
                    hasActiveFilters
                      ? {
                        label: "Limpar Filtros",
                        onClick: clearFilters,
                      }
                      : can("gastos.criar")
                        ? {
                          label: "Registrar Gasto",
                          onClick: () => handleOpenForm(),
                        }
                        : undefined
                  }
                />
              )}
            </div>
          )}

          <GastoDeleteDialog
            open={!!gastoToDelete}
            onOpenChange={(open) => !open && safeCloseDialog(() => setGastoToDelete(null))}
            gasto={gastoToDelete}
            onConfirm={confirmDelete}
            isLoading={isActionLoading}
          />
        </div>
      </PullToRefreshWrapper>

      {/* {shouldShowTutorial && (
        <VideoCommerce
          screenName="gastos"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          ctaText={can("gastos.criar") ? tutorialConfig.ctaText : undefined}
          onCtaClick={can("gastos.criar") ? () => handleOpenForm() : undefined}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_GASTOS_DISMISSED}
        />
      )} */}
    </>
  );
}
