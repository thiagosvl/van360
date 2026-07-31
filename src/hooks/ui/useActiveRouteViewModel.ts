import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { useIniciarRota, useAtualizarParadaStatus, useCancelarExecucao, useReordenarExecucao, useFinalizarExecucao } from "../api/useRouteMutations";
import { RouteStopStatus, RouteExecutionStatus, RouteExecutionPassenger } from "@/types/route";

export function useActiveRouteViewModel({ execucaoId }: { execucaoId: string }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isExplicitPreview = searchParams.get("preview") === "true";

  const execQuery = useQuery({
    queryKey: ["route-execution", execucaoId],
    queryFn: () => routeApi.getExecucao(execucaoId),
    enabled: !isExplicitPreview && !!execucaoId,
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === RouteExecutionStatus.INICIADA ? 15000 : false;
    }
  });

  const routeQuery = useQuery({
    queryKey: ["route", execucaoId],
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

  let execucao = execQuery.data;
  let paradas = execQuery.data?.paradas || [];

  if (isPreview && routeQuery.data) {
    execucao = {
      id: "",
      rota_id: routeQuery.data.id,
      usuario_id: routeQuery.data.usuario_id,
      status: "preview" as any,
      tipo: routeQuery.data.tipo,
      iniciada_em: "",
      created_at: routeQuery.data.created_at,
      rota: {
        id: routeQuery.data.id,
        nome: routeQuery.data.nome
      }
    } as any;

    paradas = (routeQuery.data.passageiros || []).map((p) => ({
      id: p.id || "",
      execucao_rota_id: "",
      tipo_no: p.tipo_no,
      passageiro_id: p.passageiro_id,
      escola_id: p.escola_id,
      status: RouteStopStatus.PENDENTE,
      ordem: p.ordem,
      passageiro: p.passageiro,
      escola: p.escola,
      sentido: p.sentido || null
    })) as any[];
  }

  const paradasPendentes = paradas.filter((p: RouteExecutionPassenger) => !p.visitado_em && p.status !== RouteStopStatus.AUSENTE);
  const paradasConcluidas = paradas.filter((p: RouteExecutionPassenger) => !!p.visitado_em || p.status === RouteStopStatus.AUSENTE);

  const paradaAtual = !isPreview && paradasPendentes.length > 0 ? paradasPendentes[0] : null;

  const proximasParadas = isPreview 
    ? paradas 
    : paradasPendentes.length > 1 
      ? paradasPendentes.slice(1) 
      : [];

  const handleStep = async (
    paradaId: string,
    status: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE,
    onSuccessCallback?: () => void
  ) => {
    if (!execucaoId || stepMutation.isPending || isPreview) return;

    await stepMutation.mutateAsync(
      {
        execucaoId,
        paradaId,
        status
      },
      {
        onSuccess: () => {
          if (onSuccessCallback) onSuccessCallback();
        }
      }
    );
  };

  const handleFinalizarRota = async (onSuccessCallback?: () => void) => {
    if (!execucaoId || finalizarMutation.isPending || isPreview) return;

    await finalizarMutation.mutateAsync(execucaoId, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  const handleReordenar = async (novaOrdem: Array<{ id: string; ordem: number }>, onSuccessCallback?: () => void) => {
    if (!execucaoId || reorderMutation.isPending || isPreview) return;

    await reorderMutation.mutateAsync(
      {
        execucaoId,
        paradas: novaOrdem
      },
      {
        onSuccess: () => {
          if (onSuccessCallback) onSuccessCallback();
        }
      }
    );
  };

  const handleCancel = async (onSuccessCallback?: () => void) => {
    if (!execucaoId || isPreview) return;

    await cancelMutation.mutateAsync(execucaoId, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  const isDataLoading = isExplicitPreview
    ? routeQuery.isLoading
    : (execQuery.isLoading || (execQuery.isError && routeQuery.isLoading));

  return {
    execucao,
    paradaAtual,
    proximasParadas,
    paradasConcluidas,
    isLoading: isDataLoading || stepMutation.isPending || cancelMutation.isPending || reorderMutation.isPending || iniciarMutation.isPending || finalizarMutation.isPending,
    isError: isExplicitPreview ? routeQuery.isError : (execQuery.isError && routeQuery.isError),
    handleStep,
    handleFinalizarRota,
    handleReordenar,
    handleCancel,
    isPreview,
    iniciarMutation
  };
}
