import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrackingGpsPing } from "@/types/tracking";
import { TRACKING_REALTIME_CONFIG } from "@/constants/tracking";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseTrackingBroadcastProps {
  execucaoId: string | null;
  enabled?: boolean;
  onGpsPing?: (ping: TrackingGpsPing) => void;
}

export function useTrackingBroadcast({
  execucaoId,
  enabled = true,
  onGpsPing
}: UseTrackingBroadcastProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onGpsPingRef = useRef(onGpsPing);

  useEffect(() => {
    onGpsPingRef.current = onGpsPing;
  }, [onGpsPing]);

  useEffect(() => {
    if (!execucaoId || !enabled) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channelName = `${TRACKING_REALTIME_CONFIG.CHANNEL_PREFIX}${execucaoId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false }
      }
    });

    channel
      .on("broadcast", { event: TRACKING_REALTIME_CONFIG.EVENT_GPS_PING }, (payload) => {
        if (payload?.payload) {
          onGpsPingRef.current?.(payload.payload as TrackingGpsPing);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [execucaoId, enabled]);

  const sendGpsPing = useCallback(
    async (ping: TrackingGpsPing) => {
      if (!channelRef.current) return;
      try {
        await channelRef.current.send({
          type: "broadcast",
          event: TRACKING_REALTIME_CONFIG.EVENT_GPS_PING,
          payload: ping
        });
      } catch {}
    },
    []
  );

  return {
    sendGpsPing
  };
}
