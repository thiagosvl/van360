import { useQuery } from "@tanstack/react-query";
import { responsavelApi } from "@/services/api/responsavel.api";
import { TrackingResponse } from "@/types/tracking";
import { RouteExecutionStatus } from "@/types/route";
import { ENABLE_LIVE_TRACKING } from "@/constants/tracking";

export const TRACKING_QUERY_KEY = "responsavel-rastreamento";

export function useTrackingQuery(passageiroId: string | undefined, token: string | null) {
  return useQuery<TrackingResponse>({
    queryKey: [TRACKING_QUERY_KEY, passageiroId],
    queryFn: async () => {
      if (!ENABLE_LIVE_TRACKING || !passageiroId || !token) {
        return { ativa: false, execucao: null };
      }
      return responsavelApi.getRastreamento(passageiroId, token);
    },
    enabled: ENABLE_LIVE_TRACKING && Boolean(passageiroId && token),
    staleTime: 1000 * 15,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.ativa && data?.execucao?.status === RouteExecutionStatus.INICIADA) {
        return 1000 * 10;
      }
      return 1000 * 30;
    }
  });
}
