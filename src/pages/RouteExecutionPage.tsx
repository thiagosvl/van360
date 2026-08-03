import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActiveRouteViewModel } from "@/hooks/ui/useActiveRouteViewModel";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RouteTimelineSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { ActiveRouteExecutionView } from "@/components/features/active-route/ActiveRouteExecutionView";
import { RouteSuccessOverlay } from "@/components/features/active-route/RouteSuccessOverlay";
import { RouteExecutionStatus } from "@/types/route";

export default function RouteExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const {
    execucao,
    paradaAtual,
    proximasParadas,
    paradasConcluidas,
    isLoading,
    isStepping,
    isFinalizing,
    isError,
    handleStep,
    handleFinalizarRota,
    handleCancel,
    handleReordenar,
    isPreview,
    iniciarMutation,
    refetch
  } = useActiveRouteViewModel({ execucaoId: id || "" });

  const concludedStops = paradasConcluidas?.length || 0;

  useEffect(() => {
    setPageTitle(isPreview ? "Prévia da Rota" : "Rota em Andamento");
  }, [setPageTitle, isPreview]);

  useEffect(() => {
    if (execucao?.status === RouteExecutionStatus.CONCLUIDA && !isPreview && !showSuccessOverlay) {
      setShowSuccessOverlay(true);
    }
  }, [execucao?.status, isPreview, showSuccessOverlay]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[400px]">
        <AlertOctagon className="w-12 h-12 text-red-500" />
        <h3 className="text-base font-bold text-[#1a3a5c] font-headline">Erro ao Carregar Corrida</h3>
        <p className="text-xs text-slate-400 font-semibold max-w-[260px]">
          Não conseguimos obter as informações desta execução da rota ativa no momento.
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
    <PullToRefreshWrapper onRefresh={refetch}>
      <div className="space-y-4 text-left pb-16">
        {(isLoading && !showSuccessOverlay) || !execucao ? (
          <RouteTimelineSkeleton count={4} />
        ) : (
          <ActiveRouteExecutionView
            execucao={execucao}
            paradaAtual={paradaAtual}
            proximasParadas={proximasParadas}
            paradasConcluidas={paradasConcluidas}
            isLoading={isLoading}
            isStepping={isStepping}
            isFinalizing={isFinalizing}
            handleStep={handleStep}
            handleFinalizarRota={handleFinalizarRota}
            handleCancel={handleCancel}
            handleReordenar={handleReordenar}
            concludedStops={concludedStops}
            totalStops={totalStops}
            progressPercentage={progressPercentage}
            isPreview={isPreview}
            iniciarMutation={iniciarMutation}
            onShowSuccess={() => setShowSuccessOverlay(true)}
          />
        )}
      </div>

      {showSuccessOverlay && (
        <RouteSuccessOverlay
          onNavigate={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
        />
      )}
    </PullToRefreshWrapper>
  );
}
