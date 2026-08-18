import { useState, useMemo, useCallback } from "react";
import { useTrackingQuery } from "@/hooks/api/useTrackingQuery";
import { useTrackingBroadcast } from "@/hooks/business/useTrackingBroadcast";
import { TrackingGpsPing } from "@/types/tracking";
import { calculateDistanceKm } from "@/utils/tracking.utils";
import { RouteExecutionStatus, RouteStopStatus, RouteSentido } from "@/types/route";

interface UseTrackingViewModelProps {
  passageiroId: string | undefined;
  token: string | null;
}

export function useTrackingViewModel({ passageiroId, token }: UseTrackingViewModelProps) {
  const { data: trackingData, isLoading, refetch } = useTrackingQuery(passageiroId, token);
  const [livePing, setLivePing] = useState<TrackingGpsPing | null>(null);

  const execucao = trackingData?.execucao ?? null;
  const execucaoId = execucao?.id ?? null;
  const isExecucaoAtiva = trackingData?.ativa === true && execucao?.status === RouteExecutionStatus.INICIADA;

  const handleGpsPing = useCallback((ping: TrackingGpsPing) => {
    setLivePing(ping);
  }, []);

  useTrackingBroadcast({
    execucaoId: isExecucaoAtiva ? execucaoId : null,
    enabled: isExecucaoAtiva,
    onGpsPing: handleGpsPing
  });

  const paradaStatus = execucao?.parada_aluno?.status ?? null;
  const isParadaPendente = paradaStatus === RouteStopStatus.PENDENTE;
  const isParadaConcluida = paradaStatus === RouteStopStatus.EMBARCADO || paradaStatus === ("desembarcado" as RouteStopStatus);
  const isParadaAusente = paradaStatus === RouteStopStatus.AUSENTE;

  const destinoCoord = useMemo<[number, number] | null>(() => {
    if (
      execucao?.destino?.latitude !== null &&
      execucao?.destino?.longitude !== null &&
      execucao?.destino?.latitude !== undefined &&
      execucao?.destino?.longitude !== undefined
    ) {
      return [execucao.destino.longitude, execucao.destino.latitude];
    }
    return null;
  }, [execucao?.destino?.latitude, execucao?.destino?.longitude]);

  const vanCoord = useMemo<[number, number] | null>(() => {
    if (livePing) {
      return [livePing.longitude, livePing.latitude];
    }
    return null;
  }, [livePing]);

  const heading = livePing?.heading ?? null;

  const distanciaKm = useMemo<number | null>(() => {
    if (!livePing || !execucao?.destino?.latitude || !execucao?.destino?.longitude) {
      return null;
    }
    return calculateDistanceKm(
      livePing.latitude,
      livePing.longitude,
      execucao.destino.latitude,
      execucao.destino.longitude
    );
  }, [livePing, execucao?.destino?.latitude, execucao?.destino?.longitude]);

  const paradasRestantes = execucao?.fila?.paradas_restantes ?? 0;
  const sentido = execucao?.parada_aluno?.sentido ?? RouteSentido.INDO;

  return {
    isLoading,
    isExecucaoAtiva,
    isParadaPendente,
    isParadaConcluida,
    isParadaAusente,
    paradaStatus,
    execucao,
    vanCoord,
    destCoord: destinoCoord,
    heading,
    distanciaKm,
    paradasRestantes,
    sentido,
    hasLivePing: Boolean(livePing),
    refetch
  };
}
