import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Banner } from "@/components/ui/Banner";
import { RotasSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
import { ProximasAusenciasDialog } from "@/components/dialogs/ProximasAusenciasDialog";
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
  const [isProximasAusenciasOpen, setIsProximasAusenciasOpen] = useState(false);
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

  const hasRotas = rotasExibidas.length > 0;

  return (
    <PullToRefreshWrapper onRefresh={vm.handleRefresh}>
      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-5 pb-24 pt-1 sm:pt-2">

        <Tabs value={vm.activeTab} onValueChange={vm.setActiveTab} className="w-full space-y-4 sm:space-y-5">
          <RotasToolbar
            activeTab={vm.activeTab}
            countMinhasRotas={vm.rotas.length}
            countHistorico={execucoesHistoricoTotal.length}
          />

          <TabsContent value={TAB_MINHAS_ROTAS} className="space-y-4 sm:space-y-5 mt-0">
            {vm.isGestor && veiculosDisponiveis.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedVeiculoFilter("TODOS")}
                  className={cn(
                    "px-3 py-1.5 rounded-[18px] text-xs font-medium shrink-0 transition-all cursor-pointer",
                    selectedVeiculoFilter === "TODOS"
                      ? "bg-primary/10 text-primary border border-primary/25 font-semibold shadow-2xs"
                      : "bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] hover:text-[#0a0a0a] hover:bg-[#ebebeb]"
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
                      "px-3 py-1.5 rounded-[18px] text-xs font-medium shrink-0 transition-all cursor-pointer",
                      selectedVeiculoFilter === v.id
                        ? "bg-primary/10 text-primary border border-primary/25 font-semibold shadow-2xs"
                        : "bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] hover:text-[#0a0a0a] hover:bg-[#ebebeb]"
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2.5 w-full">
              <Button
                variant="outline"
                disabled={!hasRotas}
                onClick={() => setIsProximasAusenciasOpen(true)}
                className="flex-1 border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs sm:text-sm h-11 rounded-[18px] px-3 sm:px-4 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <CalendarDays className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Ausências</span>
              </Button>

              {vm.can("rotas.criar_editar") && (
                <Button
                  onClick={vm.handleOpenCreateRouteDialog}
                  className="flex-1 border-none bg-primary hover:bg-primary-hover text-white font-medium text-xs sm:text-sm h-11 rounded-[18px] px-3 sm:px-4 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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

      <ProximasAusenciasDialog
        open={isProximasAusenciasOpen}
        onOpenChange={setIsProximasAusenciasOpen}
      />
    </PullToRefreshWrapper>
  );
}
