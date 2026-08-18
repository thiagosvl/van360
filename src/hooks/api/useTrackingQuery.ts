import { useQuery } from "@tanstack/react-query";
import { responsavelApi } from "@/services/api/responsavel.api";
import { TrackingResponse } from "@/types/tracking";
import { FEATURE_FLAGS } from "@/constants/tracking";

export const TRACKING_QUERY_KEY = "responsavel-rastreamento";

export function useTrackingQuery(passageiroId: string | undefined, token: string | null) {
  return useQuery<TrackingResponse>({
    queryKey: [TRACKING_QUERY_KEY, passageiroId],
    queryFn: async () => {
      if (!FEATURE_FLAGS.ENABLE_LIVE_TRACKING || !passageiroId || !token) {
        return { ativa: false, execucao: null };
      }
      return responsavelApi.getRastreamento(passageiroId, token);
    },
    enabled: Boolean(FEATURE_FLAGS.ENABLE_LIVE_TRACKING && passageiroId && token),
    staleTime: 1000 * 15,
    refetchInterval: (query) => {
      if (!FEATURE_FLAGS.ENABLE_LIVE_TRACKING) return false;
      const data = query.state.data;
      if (data?.ativa && data?.execucao?.status === "iniciada") {
        return 1000 * 10;
      }
      return 1000 * 30;
    }
  });
}
