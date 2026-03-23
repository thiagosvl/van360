import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGastosViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { CATEGORIAS_GASTOS } from "@/types/gasto";
import {
    CalendarIcon,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";

export default function Gastos() {
  const {
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
    gastos,
    totalGasto,
    mediaDiaria,
    principalCategoriaData,
    isLoading,
    isActionLoading,
    handleRefresh,
    handleDelete,
    handleOpenForm,
    veiculos,
    isProfileLoading,
  } = useGastosViewModel();

  const loading = isLoading;
  const loadingActions = isProfileLoading;

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div>
          <div className="space-y-6 md:space-y-8">
            {/* 1. Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <DateNavigation
                mes={mesFilter}
                ano={anoFilter}
                onNavigate={(m, a) => {
                  setSelectedMes(m);
                  setSelectedAno(a);
                }}
                disabled={false}
              />
            </div>

            {/* 2. KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <KPICard
                title="Gasto Total"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalGasto)}
                count={gastos.length}
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
                    <span className={cn(
                        (principalCategoriaData?.name?.length || 0 >= 12)
                          ? "text-xs sm:text-lg"
                          : "text-base sm:text-lg",
                        "font-bold"
                    )}>
                        {principalCategoriaData?.name || "-"}
                    </span>
                }
                icon={TrendingUp}
                bgClass="bg-orange-50"
                colorClass="text-orange-600"
                countText={
                    principalCategoriaData
                      ? `${Number(principalCategoriaData.percentage).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% do total`
                      : "0% do total"
                }
                countVisible={true}
              />

              <KPICard
                title="Média Diária"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(mediaDiaria)}
                icon={CalendarIcon}
                bgClass="bg-blue-50"
                colorClass="text-blue-600"
                countText="por dia"
                countVisible={true}
              />
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="p-0">
                {/* Toolbar */}
              </CardHeader>

              <CardContent className="px-0 relative">
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
                  disabled={loading || loadingActions}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                {loading ? (
                  <ListSkeleton />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
}
