import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrackingGpsPing } from "@/types/tracking";
import { TRACKING_REALTIME_CONFIG, ENABLE_LIVE_TRACKING } from "@/constants/tracking";
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
    if (!ENABLE_LIVE_TRACKING || !execucaoId || !enabled) {
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
          console.info(`[Realtime Broadcast] 📥 Ping GPS recebido:`, payload.payload);
          onGpsPingRef.current?.(payload.payload as TrackingGpsPing);
        }
      })
      .subscribe((status) => {
        console.info(`[Realtime Broadcast] 📡 Status do canal ${channelName}:`, status);
      });

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
      if (!ENABLE_LIVE_TRACKING || !channelRef.current) {
        return;
      }
      try {
        console.info(`[Realtime Broadcast] 📤 Enviando ping GPS:`, ping);
        await channelRef.current.send({
          type: "broadcast",
          event: TRACKING_REALTIME_CONFIG.EVENT_GPS_PING,
          payload: ping
        });
      } catch (err) {
        console.error(`[Realtime Broadcast] ❌ Erro ao enviar ping:`, err);
      }
    },
    []
  );

  return {
    sendGpsPing
  };
}
