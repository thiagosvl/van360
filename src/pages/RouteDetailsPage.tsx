import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActiveRouteViewModel } from "@/hooks/ui/useActiveRouteViewModel";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RouteTimelineSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { ActiveRouteHistoryView } from "@/components/features/active-route/ActiveRouteHistoryView";

import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";

export default function RouteDetailsPage() {
  const { can } = usePermissions();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();

  const {
    execucao,
    proximasParadas,
    paradasConcluidas,
    isLoading,
    isError,
  } = useActiveRouteViewModel({ execucaoId: id || "" });

  const concludedStops = paradasConcluidas?.length || 0;

  useEffect(() => {
    setPageTitle("Histórico da Rota");
  }, [setPageTitle]);

  if (!can("rotas.visualizar")) {
    return <AccessRestrictedState moduleName="Histórico de Rotas" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[400px]">
        <AlertOctagon className="w-12 h-12 text-red-500" />
        <h3 className="text-base font-bold text-[#1a3a5c] font-headline">Erro ao Carregar Corrida</h3>
        <p className="text-xs text-slate-400 font-semibold max-w-[260px]">
          Não conseguimos obter as informações desta execução no histórico no momento.
        </p>
        <Button
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
          className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-lg font-bold text-xs"
        >
          Voltar para Rotas
        </Button>
      </div>
    );
  }

  const totalStops = execucao?.paradas?.length || 0;
  const progressPercentage = totalStops > 0 ? Math.round((concludedStops / totalStops) * 100) : 0;

  return (
    <PullToRefreshWrapper onRefresh={async () => { }}>
      <div className="space-y-4 text-left pb-16">
        {isLoading && !execucao ? (
          <RouteTimelineSkeleton count={4} />
        ) : (
          <ActiveRouteHistoryView
            execucao={execucao}
            paradasConcluidas={paradasConcluidas}
            proximasParadas={proximasParadas}
            concludedStops={concludedStops}
            totalStops={totalStops}
            progressPercentage={progressPercentage}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
