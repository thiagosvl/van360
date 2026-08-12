import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Banner } from "@/components/ui/Banner";
import { RotasSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { UserMinus, Plus } from "lucide-react";
import RegistrarAusenciaDialog from "@/components/dialogs/RegistrarAusenciaDialog";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { RotasToolbar } from "@/components/features/rotas/RotasToolbar";
import { RotasList } from "@/components/features/rotas/RotasList";
import { RotasHistoricoList } from "@/components/features/rotas/RotasHistoricoList";
import { useRotasViewModel, TAB_MINHAS_ROTAS, TAB_HISTORICO } from "@/hooks/ui/useRotasViewModel";
import { useLayout } from "@/contexts/LayoutContext";
import { RouteExecutionStatus } from "@/types/route";
import { cn } from "@/lib/utils";

export default function Rotas() {
  const vm = useRotasViewModel();
  const { setPageTitle } = useLayout();
  const [isAusenciaDialogOpen, setIsAusenciaDialogOpen] = useState(false);
  const [selectedVeiculoFilter, setSelectedVeiculoFilter] = useState<string>("TODOS");

  useEffect(() => {
    setPageTitle("Rotas");
  }, [setPageTitle]);

  if (!vm.can("rotas.visualizar")) {
    return <AccessRestrictedState moduleName="Rotas e Paradas" />;
  }

  if (vm.isLoading) {
    return <RotasSkeleton />;
  }

  const execucoesAtivas = vm.execucoes.filter((e) => e.status === RouteExecutionStatus.INICIADA);
  const execucoesHistoricoTotal = vm.execucoes.filter((e) => e.status !== RouteExecutionStatus.INICIADA);
  const hasMoreHistorico = execucoesHistoricoTotal.length > vm.historicoLimit;
  const execucoesHistoricoExibidas = execucoesHistoricoTotal.slice(0, vm.historicoLimit);

  const veiculosDisponiveis = (() => {
    if (!vm.isGestor) return [];
    const map = new Map<string, string>();
    vm.rotas.forEach((r: any) => {
      if (r.veiculo_id && r.veiculo) {
        const label = r.veiculo.placa
          ? `${r.veiculo.modelo || "Veículo"} (${r.veiculo.placa})`
          : r.veiculo.modelo || r.veiculo_id;
        map.set(r.veiculo_id, label);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  })();

  const rotasExibidas = (() => {
    if (!vm.isGestor || selectedVeiculoFilter === "TODOS") return vm.rotas;
    return vm.rotas.filter((r: any) => r.veiculo_id === selectedVeiculoFilter);
  })();

  return (
    <PullToRefreshWrapper onRefresh={vm.handleRefresh}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
        {/* Banner de Rota Ativa */}
        {execucoesAtivas.length > 0 && (
          <Banner
            variant="success"
            icon={
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            }
            title={
              execucoesAtivas.length === 1
                ? "1 rota acontecendo agora!"
                : `${execucoesAtivas.length} rotas acontecendo agora!`
            }
            description={
              execucoesAtivas.length === 1
                ? "Confira abaixo a rota que está com status em execução."
                : `Confira abaixo as ${execucoesAtivas.length} rotas que estão com status em execução.`
            }
          />
        )}

        <Tabs value={vm.activeTab} onValueChange={vm.setActiveTab} className="w-full space-y-6">
          <RotasToolbar />

          <TabsContent value={TAB_MINHAS_ROTAS} className="space-y-4 mt-0">
            {/* Filtro por Veículo (para gestores com múltiplas vans) */}
            {vm.isGestor && veiculosDisponiveis.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedVeiculoFilter("TODOS")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer",
                    selectedVeiculoFilter === "TODOS"
                      ? "bg-[#1a3a5c] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Todas as Vans
                </button>
                {veiculosDisponiveis.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVeiculoFilter(v.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer",
                      selectedVeiculoFilter === v.id
                        ? "bg-[#1a3a5c] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            {/* Barra de Ações Rápidas */}
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setIsAusenciaDialogOpen(true)}
                className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-4 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserMinus className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Registrar Ausência</span>
              </Button>

              {vm.can("rotas.criar_editar") && (
                <Button
                  onClick={vm.handleOpenCreateRouteDialog}
                  className="flex-1 border-none bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-6 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Nova Rota</span>
                </Button>
              )}
            </div>

            <RotasList
              rotas={rotasExibidas}
              execucoesAtivas={execucoesAtivas}
              isLoading={vm.isLoading}
              canGerenciar={vm.can("rotas.criar_editar")}
              canExcluir={vm.can("rotas.excluir")}
              onDeleteRoute={vm.handleDeleteRoute}
              onOpenCreateRoute={vm.handleOpenCreateRouteDialog}
            />
          </TabsContent>

          <TabsContent value={TAB_HISTORICO} className="space-y-4 mt-0">
            <RotasHistoricoList
              execucoes={execucoesHistoricoExibidas}
              isLoading={vm.isLoading}
              isFetching={vm.isFetching}
              hasMore={hasMoreHistorico}
              onLoadMore={vm.handleLoadMoreHistorico}
            />
          </TabsContent>
        </Tabs>
      </div>

      <RegistrarAusenciaDialog
        isOpen={isAusenciaDialogOpen}
        onClose={() => setIsAusenciaDialogOpen(false)}
      />
    </PullToRefreshWrapper>
  );
}
