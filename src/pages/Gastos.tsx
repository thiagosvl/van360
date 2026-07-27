import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import GastoDeleteDialog from "@/components/dialogs/GastoDeleteDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { useGastosViewModel } from "@/hooks";
import { KPICardVariant } from "@/types/enums";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  TrendingDown,
  Wallet
} from "lucide-react";

export default function Gastos() {
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

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6">
        {/* 1. Header & Navigation */}
        <DateNavigation
          mes={mesFilter}
          ano={anoFilter}
          onNavigate={(m, a) => {
            setFilters({ mes: m, ano: a });
          }}
          disabled={false}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
          <div className="order-2 md:order-1 w-full md:w-auto md:min-w-[280px]">
            <KPICard
              label="Total de Despesas"
              variant={KPICardVariant.PRIMARY}
              value={formatCurrency(totalGasto)}
              valueClassName="text-rose-600"
              icon={TrendingDown}
              countLabel="no Mês"
            />
          </div>

          <div className="order-1 md:order-2 w-full md:w-auto">
            <GastosToolbar
              categoriaFilter={categoriaFilter}
              onCategoriaChange={(val) =>
                setSelectedCategoria(val)
              }
              veiculoFilter={veiculoFilter}
              onVeiculoChange={(val) =>
                setSelectedVeiculo(val)
              }
              onApplyFilters={(filters) => {
                setFilters({
                  categoria: filters.categoria,
                  veiculo: filters.veiculo
                });
              }}
              onRegistrarGasto={() => {
                handleOpenForm();
              }}
              categorias={categorias}
              veiculos={veiculos}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
            Gastos
          </h2>
          {(() => {
            const sectionCount = gastos.length;
            const countLabel = hasActiveFilters
              ? (sectionCount === 1 ? "ENCONTRADO" : "ENCONTRADOS")
              : (sectionCount === 1 ? "REGISTRO" : "REGISTROS");
            return sectionCount != null ? (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {sectionCount} {countLabel}
              </span>
            ) : null;
          })()}
        </div>

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

            {!loading &&
              gastos.length === 0 && (
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
                      : {
                        label: "Registrar Gasto",
                        onClick: () => handleOpenForm(),
                      }
                  }
                />
              )}
          </div>
        )}

        <GastoDeleteDialog
          open={!!gastoToDelete}
          onOpenChange={(open) => !open && setGastoToDelete(null)}
          gasto={gastoToDelete}
          onConfirm={confirmDelete}
          isLoading={isActionLoading}
        />
      </div>
    </PullToRefreshWrapper>
  );
}
