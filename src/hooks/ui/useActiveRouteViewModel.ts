import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { useIniciarRota, useAtualizarParadaStatus, useCancelarExecucao, useReordenarExecucao, useFinalizarExecucao } from "../api/useRouteMutations";
import { useExecucoesRota } from "../api/useRoutes";
import { useSession } from "../business/useSession";
import { RouteStopStatus, RouteExecutionStatus, RouteExecutionPassenger, RoutePassenger } from "@/types/route";

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
    retry: false,
    refetchInterval: false
  });

  const routeQuery = useQuery({
    queryKey: ["route-detail", execucaoId],
    queryFn: () => routeApi.getRoute(execucaoId),
    enabled: (isExplicitPreview || !!execQuery.isError) && !!execucaoId,
    retry: false,
  });
  const stepMutation = useAtualizarParadaStatus();
  const reorderMutation = useReordenarExecucao();
  const cancelMutation = useCancelarExecucao();
  const finalizarMutation = useFinalizarExecucao();
  const iniciarMutation = useIniciarRota();

  const isPreview = isExplicitPreview || (!!execQuery.isError && !!routeQuery.data);

  const { data: execucoesList = [] } = useExecucoesRota(userId, { enabled: isPreview && !!userId });

  let execucao = (!isPreview && execQuery.data) ? execQuery.data : routeQuery.data;
  let paradas: RouteExecutionPassenger[] = (!isPreview && execQuery.data?.paradas) ? execQuery.data.paradas : [];

  const targetVeiculoId = routeQuery.data?.veiculo_id || execQuery.data?.rota?.veiculo_id || (execucao as any)?.veiculo_id || (execucao as any)?.rota?.veiculo_id;
  const currentRouteId = routeQuery.data?.id || (execQuery.data as any)?.rota_id || execucaoId;

  const occupiedExec = useMemo(() => {
    if (!isPreview || !execucoesList || execucoesList.length === 0) return null;
    return execucoesList.find(e => {
      if (e.status !== RouteExecutionStatus.INICIADA) return false;
      if (e.rota_id === currentRouteId || e.rota?.id === currentRouteId) return false;
      const execVeiculoId = e.rota?.veiculo_id;
      if (targetVeiculoId && execVeiculoId) {
        return targetVeiculoId === execVeiculoId;
      }
      return false;
    });
  }, [isPreview, targetVeiculoId, execucoesList, currentRouteId]);

  const isVehicleOccupied = !!occupiedExec;
  const occupiedRouteName = occupiedExec?.rota?.nome || "";

  if (isPreview && routeQuery.data) {
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
        veiculo_id: routeQuery.data.veiculo_id
      }
    };

    paradas = (routeQuery.data.passageiros || []).map((p: RoutePassenger): RouteExecutionPassenger => ({
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

  const isDataLoading = isExplicitPreview ? routeQuery.isLoading : (execQuery.isLoading || (execQuery.isError && routeQuery.isLoading));
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
