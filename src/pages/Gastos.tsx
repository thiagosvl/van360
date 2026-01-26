import { useCallback, useEffect, useState } from "react";

import { toast } from "@/utils/notifications/toast";

import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";

import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";

import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteGasto, useFilters, useGastos, useVeiculos } from "@/hooks";
import { useGastosCalculations } from "@/hooks/business/useGastosCalculations";
import { usePermissions } from "@/hooks/business/usePermissions";

import { cn } from "@/lib/utils";


import { CATEGORIAS_GASTOS, Gasto } from "@/types/gasto";

import {
  CalendarIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function Gastos() {
  const { setPageTitle, openGastoFormDialog } = useLayout();
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

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    profile,
    isLoading: isAuthLoading,
    is_read_only,
  } = usePermissions();
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
  const veiculos = veiculosData?.list || [];

  const displayData = useGastosCalculations({
    gastos,
    mesFilter,
    anoFilter,
    searchTerm,
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
      });
    },
    [openGastoFormDialog, veiculos, profile?.id]
  );

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
                disabled={false}
              />
            </div>

            {/* 2. KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <KPICard
                title="Gasto Total"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(displayData.totalGasto)}
                count={displayData.gastosFiltrados.length}
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
                        (displayData.principalCategoriaData?.name?.length >= 12)
                          ? "text-xs sm:text-lg"
                          : "text-base sm:text-lg",
                        "font-bold"
                    )}>
                        {displayData.principalCategoriaData?.name || "-"}
                    </span>
                }
                icon={TrendingUp}
                bgClass="bg-orange-50"
                colorClass="text-orange-600"
                countText={
                    displayData.principalCategoriaData
                      ? `${Number(displayData.principalCategoriaData.percentage).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% do total`
                      : "0% do total"
                }
                countVisible={true}
              />

              <KPICard
                title="Média Diária"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(displayData.mediaDiaria)}
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
                    setSelectedCategoria && setSelectedCategoria(val)
                  }
                  veiculoFilter={veiculoFilter}
                  onVeiculoChange={(val) =>
                    setSelectedVeiculo && setSelectedVeiculo(val)
                  }
                  onRegistrarGasto={() => openDialog()}
                  categorias={CATEGORIAS_GASTOS}
                  veiculos={veiculos.map((v) => ({ id: v.id, placa: v.placa }))}
                  disabled={loading || loadingActions}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                {loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="relative">
                    <GastosList
                      gastos={displayData.gastosFiltrados}
                      onEdit={openDialog}
                      onDelete={handleDelete}
                      veiculos={veiculos.map((v) => ({
                            id: v.id,
                            placa: v.placa,
                        }))
                      }
                    />

                    {!loading &&
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
