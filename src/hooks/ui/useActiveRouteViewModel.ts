import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { useIniciarRota, useAtualizarParadaStatus, useCancelarExecucao, useReordenarExecucao, useFinalizarExecucao } from "../api/useRouteMutations";
import { useExecucaoAtivaVeiculo } from "../api/useRoutes";
import { useSession } from "../business/useSession";
import { RouteStopStatus, RouteExecutionStatus, RouteExecutionPassenger, RoutePassenger, RouteExecution } from "@/types/route";

export function useActiveRouteViewModel({ execucaoId }: { execucaoId: string }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isExplicitPreview = searchParams.get("preview") === "true";
  const { user } = useSession();
  const userId = user?.id || "";

  const execQuery = useQuery({
    queryKey: ["route-execution", execucaoId],
    queryFn: () => routeApi.getExecucao(execucaoId),
    enabled: !isExplicitPreview && !!execucaoId,
    staleTime: 1000 * 30,
    retry: false,
    refetchInterval: false
  });

  const routeQuery = useQuery({
    queryKey: ["route-detail", execucaoId],
    queryFn: () => routeApi.getRoute(execucaoId),
    enabled: (isExplicitPreview || !!execQuery.isError) && !!execucaoId,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });
  const stepMutation = useAtualizarParadaStatus();
  const reorderMutation = useReordenarExecucao();
  const cancelMutation = useCancelarExecucao();
  const finalizarMutation = useFinalizarExecucao();
  const iniciarMutation = useIniciarRota();

  const isPreview = isExplicitPreview || (!!execQuery.isError && !!routeQuery.data);

  let execucao: RouteExecution | undefined = undefined;
  let paradas: RouteExecutionPassenger[] = [];

  if (!isPreview && execQuery.data) {
    execucao = execQuery.data;
    paradas = execQuery.data.paradas || [];
  } else if (routeQuery.data) {
    execucao = {
      id: "",
      rota_id: routeQuery.data.id,
      usuario_id: routeQuery.data.usuario_id,
      status: RouteExecutionStatus.PREVIEW,
      iniciada_em: "",
      created_at: routeQuery.data.created_at,
      rota: {
        id: routeQuery.data.id,
        nome: routeQuery.data.nome,
        veiculo_id: routeQuery.data.veiculo_id ?? undefined
      }
    };

    paradas = (routeQuery.data.paradas || []).map((p: RoutePassenger): RouteExecutionPassenger => ({
      id: p.id || "",
      execucao_rota_id: "",
      tipo_no: p.tipo_no,
      passageiro_id: p.passageiro_id,
      escola_id: p.escola_id,
      status: p.status || (p.is_ausente ? RouteStopStatus.AUSENTE : RouteStopStatus.PENDENTE),
      is_ausente: p.is_ausente,
      ausencia_id: p.ausencia_id,
      ordem: p.ordem,
      passageiro: p.passageiro,
      escola: p.escola,
      sentido: p.sentido || null
    }));
  }

  const targetVeiculoId = (routeQuery.data?.veiculo_id || execQuery.data?.rota?.veiculo_id || execucao?.rota?.veiculo_id) ?? undefined;
  const currentRouteId = routeQuery.data?.id || execQuery.data?.rota_id || execucao?.rota_id || execucaoId;

  const { data: activeExecVeiculo, isLoading: isLoadingActiveVeiculo } = useExecucaoAtivaVeiculo(targetVeiculoId, {
    enabled: isPreview && !!targetVeiculoId,
  });

  const isVehicleOccupied = !!activeExecVeiculo && activeExecVeiculo.rota_id !== currentRouteId;
  const occupiedRouteName = (activeExecVeiculo?.rota as any)?.nome || "";

  const isDataLoading = isExplicitPreview
    ? (routeQuery.isLoading || (!!targetVeiculoId && isLoadingActiveVeiculo))
    : (execQuery.isLoading || (execQuery.isError && (routeQuery.isLoading || (!!targetVeiculoId && isLoadingActiveVeiculo))));
  const isStartingRoute = iniciarMutation.isPending;

  const refetch = () => {
    if (isPreview) {
      routeQuery.refetch();
    } else {
      execQuery.refetch();
    }
  };

  const paradasConcluidas = paradas.filter((p: RouteExecutionPassenger) => !!p.visitado_em || p.status === RouteStopStatus.AUSENTE || p.is_ausente);
  const paradasPendentes = paradas.filter((p: RouteExecutionPassenger) => !p.visitado_em && p.status !== RouteStopStatus.AUSENTE && !p.is_ausente);

  const paradaAtual = !isPreview && paradasPendentes.length > 0 ? paradasPendentes[0] : null;

  const proximasParadas = isPreview
    ? paradasPendentes
    : paradasPendentes.length > 1
      ? paradasPendentes.slice(1)
      : [];

  const handleStep = async (stopId: string, status: RouteStopStatus) => {
    if (!execucao?.id || isPreview) return;
    await stepMutation.mutateAsync({ execucaoId: execucao.id, paradaId: stopId, status });
  };

  const handleFinalizarRota = async (onSuccessCallback?: () => void) => {
    if (!execucao?.id || isPreview) return;

    await finalizarMutation.mutateAsync(execucao.id, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  const handleCancel = async (onSuccessCallback?: () => void) => {
    if (!execucao?.id || isPreview) return;

    await cancelMutation.mutateAsync(execucao.id, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  const handleReordenar = async (novaOrdem: Array<{ id: string; ordem: number }>, onSuccessCallback?: () => void) => {
    if (!execucao?.id || isPreview) return;

    await reorderMutation.mutateAsync({ execucaoId: execucao.id, paradas: novaOrdem }, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  const totalStops = (paradasConcluidas?.length || 0) + (paradaAtual ? 1 : 0) + (proximasParadas?.length || 0);
  const concludedStops = paradasConcluidas?.length || 0;
  const progressPercentage = totalStops > 0 ? Math.round((concludedStops / totalStops) * 100) : 0;

  return {
    execucao,
    paradaAtual,
    proximasParadas,
    paradasConcluidas,
    totalStops,
    progressPercentage,
    isLoading: isDataLoading || isStartingRoute || cancelMutation.isPending,
    isStepping: stepMutation.isPending,
    isFinalizing: finalizarMutation.isPending,
    isReordering: reorderMutation.isPending,
    isFetching: execQuery.isFetching || routeQuery.isFetching,
    isError: isExplicitPreview ? routeQuery.isError : (execQuery.isError && routeQuery.isError),
    handleStep,
    handleFinalizarRota,
    handleReordenar,
    handleCancel,
    isPreview,
    isVehicleOccupied,
    occupiedRouteName,
    iniciarMutation,
    refetch
  };
}
