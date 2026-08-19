import { useState, useMemo, useCallback } from "react";
import { useTrackingQuery } from "@/hooks/api/useTrackingQuery";
import { useTrackingBroadcast } from "@/hooks/business/useTrackingBroadcast";
import { TrackingGpsPing } from "@/types/tracking";
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

  const rastreamentoAtivo = execucao?.rastreamento_ativo !== false;
  const rastreamentoModo = execucao?.rastreamento_modo ?? "completo";
  const isLiberadoGps = execucao?.is_liberado_gps ?? (rastreamentoAtivo && (rastreamentoModo === "completo" || (execucao?.fila?.paradas_restantes ?? 0) === 0));

  const handleGpsPing = useCallback((ping: TrackingGpsPing) => {
    setLivePing(ping);
  }, []);

  useTrackingBroadcast({
    execucaoId: isExecucaoAtiva && rastreamentoAtivo && isLiberadoGps ? execucaoId : null,
    enabled: isExecucaoAtiva && rastreamentoAtivo && isLiberadoGps,
    onGpsPing: handleGpsPing
  });

  const paradaStatus = execucao?.parada_aluno?.status ?? null;
  const isParadaPendente = paradaStatus === RouteStopStatus.PENDENTE;
  const isParadaConcluida = paradaStatus === RouteStopStatus.EMBARCADO || paradaStatus === RouteStopStatus.DESEMBARCADO;
  const isParadaAusente = paradaStatus === RouteStopStatus.AUSENTE;

  const vanCoord = useMemo<[number, number] | null>(() => {
    if (
      livePing &&
      typeof livePing.latitude === "number" &&
      typeof livePing.longitude === "number" &&
      !isNaN(livePing.latitude) &&
      !isNaN(livePing.longitude) &&
      (livePing.latitude !== 0 || livePing.longitude !== 0)
    ) {
      return [livePing.longitude, livePing.latitude];
    }
    return null;
  }, [livePing]);

  const heading = livePing?.heading ?? null;
  const speed = livePing?.speed ?? null;

  const paradasRestantes = execucao?.fila?.paradas_restantes ?? 0;
  const sentido = execucao?.parada_aluno?.sentido ?? RouteSentido.INDO;
  const destinoEndereco = execucao?.destino?.endereco ?? "";

  const isEmbarcadoNaIda = isExecucaoAtiva && sentido === RouteSentido.INDO && paradaStatus === RouteStopStatus.EMBARCADO;
  const isFinalizado = paradaStatus === RouteStopStatus.DESEMBARCADO || (!isExecucaoAtiva && paradaStatus === RouteStopStatus.EMBARCADO);

  return {
    isLoading,
    isExecucaoAtiva,
    isParadaPendente,
    isParadaConcluida,
    isEmbarcadoNaIda,
    isFinalizado,
    isParadaAusente,
    rastreamentoAtivo,
    rastreamentoModo,
    isLiberadoGps,
    paradaStatus,
    execucao,
    vanCoord,
    heading,
    speed,
    paradasRestantes,
    sentido,
    destinoEndereco,
    hasLivePing: Boolean(livePing),
    refetch
  };
}
