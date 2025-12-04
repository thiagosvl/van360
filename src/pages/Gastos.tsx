// React
import { useCallback, useEffect, useMemo, useState } from "react";

// Third-party
import { toast } from "@/utils/notifications/toast";

// Components - Alerts

// Components - UI
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
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
  useDeleteGasto,
  useFilters,
  useGastos,
  useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Utils
import { cn } from "@/lib/utils";
import { enablePageActions } from "@/utils/domain/pages/pagesUtils";

// Types
import { CATEGORIAS_GASTOS, Gasto } from "@/types/gasto";

// Icons
import {
  CalendarIcon,
  FileText,
  Lock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const MOCK_DATA_NO_ACCESS = {
  totalGasto: 12500.5,
  principalCategoriaData: {
    name: "Combustível",
    value: 4500.0,
    percentage: 36,
  },
  mediaDiaria: 416.68,
  gastos: [
    {
      id: "1",
      categoria: "Combustível",
      descricao: "Abastecimento Semanal",
      valor: 450.0,
      data: new Date().toISOString(),
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
    {
      id: "2",
      categoria: "Manutenção",
      descricao: "Troca de Óleo",
      valor: 250.0,
      data: new Date().toISOString(),
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
    {
      id: "3",
      categoria: "Salário",
      descricao: "Adiantamento Motorista",
      valor: 1200.0,
      data: new Date().toISOString(),
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
    {
      id: "4",
      categoria: "Vistorias",
      descricao: "Vistoria Semestral",
      valor: 150.0,
      data: new Date().toISOString(),
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
    {
      id: "5",
      categoria: "Documentação",
      descricao: "Licenciamento Anual",
      valor: 350.0,
      data: new Date().toISOString(),
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
  ] as Gasto[],
};

export default function Gastos() {
  const { setPageTitle } = useLayout();
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
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const { user } = useSession();
  const { profile, plano } = useProfile(user?.id);
  const [enabledPageActions, setEnabledPageActions] = useState(false);

  // Verificar permissão antes de fazer requisição
  useEffect(() => {
    if (!profile?.id) return;

    const canAccess = enablePageActions("/gastos", plano);

    setEnabledPageActions(canAccess);
  }, [profile?.id, plano]);

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

  const gastosFiltrados = useMemo(() => {
    if (!searchTerm) return gastos;
    const lowerSearch = searchTerm.toLowerCase();
    return gastos.filter(
      (g) =>
        g.descricao?.toLowerCase().includes(lowerSearch) ||
        g.categoria.toLowerCase().includes(lowerSearch)
    );
  }, [gastos, searchTerm]);

  const { totalGasto, principalCategoriaData, mediaDiaria } = useMemo(() => {
    // Garantir que gastos seja um array válido
    const gastosArray = Array.isArray(gastos) ? gastos : [];

    const total = gastosArray.reduce((sum, g) => {
      const valor = Number(g?.valor) || 0;
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);

    const gastosPorCategoria = gastosArray.reduce((acc, gasto) => {
      if (!gasto?.categoria) return acc;
      if (!acc[gasto.categoria]) {
        acc[gasto.categoria] = { total: 0, count: 0 };
      }
      const valor = Number(gasto.valor) || 0;
      acc[gasto.categoria].total += isNaN(valor) ? 0 : valor;
      acc[gasto.categoria].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const principal =
      gastosArray.length > 0 && Object.keys(gastosPorCategoria).length > 0
        ? Object.entries(gastosPorCategoria).reduce((a, b) =>
            a[1].total > b[1].total ? a : b
          )
        : null;

    // Calculate Daily Average
    const now = new Date();
    let daysPassed = 1;

    if (
      anoFilter < now.getFullYear() ||
      (anoFilter === now.getFullYear() && mesFilter < now.getMonth() + 1)
    ) {
      // Past month: use total days in month
      daysPassed = new Date(anoFilter, mesFilter, 0).getDate();
    } else if (
      anoFilter === now.getFullYear() &&
      mesFilter === now.getMonth() + 1
    ) {
      // Current month: use current day
      daysPassed = now.getDate();
    } else {
      // Future month: 1 (avoid division by zero, though no expenses should exist)
      daysPassed = 1;
    }

    const media = total > 0 && daysPassed > 0 ? total / daysPassed : 0;
    const topCatPercentage =
      principal && total > 0 ? (principal[1].total / total) * 100 : 0;

    return {
      totalGasto: isNaN(total) ? 0 : total,
      principalCategoriaData: principal
        ? {
            name: principal[0] || "-",
            value: isNaN(principal[1].total) ? 0 : principal[1].total,
            percentage: isNaN(topCatPercentage) ? 0 : topCatPercentage,
          }
        : null,
      mediaDiaria: isNaN(media) ? 0 : media,
    };
  }, [gastos, mesFilter, anoFilter]);

  // Use mock data if access is restricted
  const displayData = enabledPageActions
    ? {
        totalGasto,
        principalCategoriaData,
        mediaDiaria,
        gastosFiltrados,
      }
    : {
        totalGasto: MOCK_DATA_NO_ACCESS.totalGasto,
        principalCategoriaData: MOCK_DATA_NO_ACCESS.principalCategoriaData,
        mediaDiaria: MOCK_DATA_NO_ACCESS.mediaDiaria,
        gastosFiltrados: MOCK_DATA_NO_ACCESS.gastos,
      };

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
      setEditingGasto(gasto);
      setIsDialogOpen(true);
    },
    []
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
                countLabel="Lançamento"
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
                  onRegistrarGasto={() => openDialog()}
                  categorias={CATEGORIAS_GASTOS}
                  veiculos={veiculos.map((v) => ({ id: v.id, placa: v.placa }))}
                  disabled={!enabledPageActions}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                {loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="relative">
                    <GastosList
                      gastos={
                        enabledPageActions
                          ? gastosFiltrados
                          : MOCK_DATA_NO_ACCESS.gastos
                      }
                      onEdit={openDialog}
                      onDelete={handleDelete}
                      isRestricted={!enabledPageActions}
                      veiculos={veiculos.map((v) => ({
                        id: v.id,
                        placa: v.placa,
                      }))}
                    />

                    {!enabledPageActions && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white z-10 hidden md:flex flex-col items-center justify-end pb-12">
                        <div className="flex flex-col items-center text-center max-w-md px-4 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50">
                          <div className="bg-orange-100 rounded-full p-4 mb-4 shadow-sm">
                            <Lock className="w-8 h-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Libere seu Controle de Gastos
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Tenha visibilidade total das despesas do seu negócio
                            e saiba exatamente para onde está indo seu dinheiro.
                          </p>
                          <Button
                            onClick={() =>
                              (window.location.href =
                                "/planos?plano=essencial")
                            }
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12 px-8 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:-translate-y-0.5"
                          >
                            Liberar Agora
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {enabledPageActions &&
                  !loading &&
                  gastosFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-200">
                      <FileText className="w-12 h-12 mb-4 text-gray-300" />
                      <p>
                        {searchTerm
                          ? `Nenhum gasto encontrado para "${searchTerm}"`
                          : "Nenhum gasto registrado no mês indicado"}
                      </p>
                    </div>
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
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
      
      {/* Mobile Sticky Footer for No Access */}
      {!enabledPageActions && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden safe-area-pb">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                Visualize seus dados reais.
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Libere o acesso agora.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = "/planos?plano=essencial")}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold whitespace-nowrap"
            >
              Liberar Acesso
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
