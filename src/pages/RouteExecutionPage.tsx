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

import { supabase } from "@/integrations/supabase/client";

import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/notifications/toast";
import { isRecentLocalMutation, debounceRealtimeSync } from "@/hooks/api/useRouteMutations";
import { useBackgroundTracking } from "@/hooks/business/useBackgroundTracking";
import { useTrackingBroadcast } from "@/hooks/business/useTrackingBroadcast";
import { Capacitor } from "@capacitor/core";
import { Banner } from "@/components/ui/Banner";
import { ENABLE_LIVE_TRACKING } from "@/constants/tracking";
import "@/utils/tracking-simulator";

export default function RouteExecutionPage() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
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
    totalStops,
    progressPercentage,
    isPreview,
    isVehicleOccupied,
    occupiedRouteName,
    iniciarMutation,
    refetch
  } = useActiveRouteViewModel({ execucaoId: id || "" });

  const concludedStops = paradasConcluidas?.length || 0;
  const isRouteActive = Boolean(
    ENABLE_LIVE_TRACKING &&
    !isPreview &&
    execucao?.id &&
    (execucao as any)?.status === RouteExecutionStatus.INICIADA &&
    (execucao as any)?.notificar_pais !== false &&
    (execucao as any)?.rastreamento_ativo !== false
  );

  const { sendGpsPing } = useTrackingBroadcast({
    execucaoId: isRouteActive ? execucao?.id || id || null : null,
    enabled: isRouteActive
  });

  useBackgroundTracking({
    execucaoId: isRouteActive ? execucao?.id || id || null : null,
    active: isRouteActive,
    onLocationUpdate: sendGpsPing
  });

  // Supabase Realtime Sync para Motorista Auxiliar + Monitor
  useEffect(() => {
    const targetExecId = execucao?.id || id;
    const targetRotaId = (execucao as any)?.rota_id || execucao?.id || id;
    if (!targetExecId && !targetRotaId) return;

    if (isPreview) {
      const previewChannel = supabase
        .channel("van360-fleet-sync")
        .on(
          "broadcast",
          { event: "route_execution_changed" },
          (payload: any) => {
            const payloadData = payload?.payload || payload;
            if (payloadData?.rotaId === targetRotaId && payloadData?.status === RouteExecutionStatus.INICIADA && payloadData?.execucaoId) {
              toast.info("Esta rota foi iniciada.");
              queryClient.invalidateQueries({ queryKey: ["routes-list"] });
              navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", payloadData.execucaoId), { replace: true });
            }
          }
        )
        .on(
          "broadcast",
          { event: "absence_changed" },
          (payload: any) => {
            if (isRecentLocalMutation()) return;
            const payloadData = payload?.payload || payload;
            if (!payloadData?.rotaId || payloadData?.rotaId === targetRotaId) {
              debounceRealtimeSync(`preview-${targetRotaId}`, () => refetch());
            }
          }
        )
        .on(
          "broadcast",
          { event: "route_definition_changed" },
          (payload: any) => {
            if (isRecentLocalMutation()) return;
            const payloadData = payload?.payload || payload;
            if (payloadData?.rotaId === targetRotaId) {
              if (payloadData?.action === "delete") {
                toast.info("Esta rota foi excluída.");
                queryClient.invalidateQueries({ queryKey: ["routes-list"] });
                navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES, { replace: true });
              } else {
                debounceRealtimeSync(`preview-${targetRotaId}`, () => refetch());
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rota_ausencias'
          },
          () => {
            if (isRecentLocalMutation()) return;
            debounceRealtimeSync(`preview-${targetRotaId}`, () => refetch());
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'execucoes_rota',
            filter: `rota_id=eq.${targetRotaId}`
          },
          (payload: any) => {
            if (isRecentLocalMutation()) return;
            queryClient.invalidateQueries({ queryKey: ["routes-list"] });
            queryClient.invalidateQueries({ queryKey: ["routes", "execucoes"] });
            const newExecId = payload.new?.id;
            const newStatus = payload.new?.status;
            if (newExecId && newStatus === RouteExecutionStatus.INICIADA) {
              toast.info("Esta rota foi iniciada.");
              navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", newExecId), { replace: true });
            } else {
              debounceRealtimeSync(`preview-${targetRotaId}`, () => refetch());
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'rotas',
            filter: `id=eq.${targetRotaId}`
          },
          () => {
            toast.info("Esta rota foi excluída.");
            queryClient.invalidateQueries({ queryKey: ["routes-list"] });
            navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES, { replace: true });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(previewChannel);
      };
    }

    const triggerRealtimeSync = () => {
      if (isStepping || isRecentLocalMutation()) return;
      debounceRealtimeSync(`execution-${targetExecId}`, () => {
        queryClient.invalidateQueries({ queryKey: ["route-execution", id || targetExecId] });
        queryClient.invalidateQueries({ queryKey: ["routes-list"], refetchType: "none" });
        queryClient.invalidateQueries({ queryKey: ["routes", "execucoes"], refetchType: "none" });
      });
    };

    const channel = supabase
      .channel("van360-fleet-sync")
      .on(
        'broadcast',
        { event: 'route_execution_changed' },
        (payload: any) => {
          const payloadData = payload?.payload || payload;
          if (!payloadData?.execucaoId || payloadData?.execucaoId === id) {
            triggerRealtimeSync();
          }
        }
      )
      .on(
        'broadcast',
        { event: 'absence_changed' },
        (payload: any) => {
          const payloadData = payload?.payload || payload;
          if (!payloadData?.rotaId || payloadData?.rotaId === targetRotaId) {
            triggerRealtimeSync();
          }
        }
      )
      .on(
        'broadcast',
        { event: 'stop_status_changed' },
        (payload: any) => {
          const payloadData = payload?.payload || payload;
          if (!payloadData?.execucaoId || payloadData?.execucaoId === id) {
            triggerRealtimeSync();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rota_ausencias'
        },
        () => {
          triggerRealtimeSync();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'execucoes_rota_passageiros',
          filter: `execucao_rota_id=eq.${targetExecId}`
        },
        () => {
          triggerRealtimeSync();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'execucoes_rota',
          filter: `id=eq.${targetExecId}`
        },
        () => {
          triggerRealtimeSync();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, execucao?.id, (execucao as any)?.rota_id, isPreview, refetch, queryClient]);

  useEffect(() => {
    setPageTitle(isPreview ? "Prévia da Rota" : "Rota em Andamento");
  }, [setPageTitle, isPreview]);

  useEffect(() => {
    const currentStatus = (execucao as any)?.status;
    if (currentStatus === RouteExecutionStatus.CONCLUIDA && !isPreview && !showSuccessOverlay) {
      setShowSuccessOverlay(true);
    }
    if (currentStatus === RouteExecutionStatus.CANCELADA && !isPreview) {
      toast.info("A execução desta rota foi encerrada.");
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      queryClient.resetQueries({ queryKey: ["routes"] });
      navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES, { replace: true });
    }
    if (isPreview && isError) {
      toast.info("Esta rota foi excluída.");
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      queryClient.resetQueries({ queryKey: ["routes"] });
      navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES, { replace: true });
    }
  }, [(execucao as any)?.status, isPreview, isError, showSuccessOverlay, navigate, queryClient]);

  if (!can("rotas.visualizar")) {
    return <AccessRestrictedState moduleName="Execução de Rotas" />;
  }

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

  return (
    <PullToRefreshWrapper onRefresh={refetch}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
        {isRouteActive && !Capacitor.isNativePlatform() && (
          <Banner
            variant="warning"
            title="Você está executando a rota pelo navegador"
            description="Para transmitir a sua localização GPS em tempo real aos pais em segundo plano (com a tela desligada ou usando o Waze), utilize o aplicativo Van360 instalado no celular."
          />
        )}

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
            isVehicleOccupied={isVehicleOccupied}
            occupiedRouteName={occupiedRouteName}
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
