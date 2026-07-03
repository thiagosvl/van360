import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { useGastosViewModel } from "@/hooks";
import { KPICardVariant } from "@/types/enums";
import { CATEGORIAS_GASTOS } from "@/types/gasto";
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
    searchTerm,
    setSearchTerm,
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
    hasActiveFilters,
    clearFilters,
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
          categorias={CATEGORIAS_GASTOS}
          veiculos={veiculos}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* 2. KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-1">
          <KPICard
            label="Total de Despesas"
            variant={KPICardVariant.PRIMARY}
            value={formatCurrency(totalGasto)}
            valueClassName="text-rose-600"
            icon={TrendingDown}
            countLabel="no Mês"
            className="col-span-1"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
            Gastos
          </h2>
          {(() => {
            const sectionCount = gastos.length;
            const countLabel = searchTerm || hasActiveFilters
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
                        onClick: () => handleOpenForm(),
                      }
                      : undefined
                  }
                />
              )}
          </div>
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
