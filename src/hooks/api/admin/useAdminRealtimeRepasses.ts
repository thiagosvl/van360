import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ADMIN_REPASSE_KEYS } from "./useAdminRepasseHooks";
import { AdminRepasseItem } from "@/types/admin-repasse";

interface UseAdminRealtimeRepassesOptions {
  enabled?: boolean;
  onRepasseChange?: (repasse: Partial<AdminRepasseItem>) => void;
}

export function useAdminRealtimeRepasses({
  enabled = true,
  onRepasseChange,
}: UseAdminRealtimeRepassesOptions = {}) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRepasseChangeRef = useRef(onRepasseChange);

  useEffect(() => {
    onRepasseChangeRef.current = onRepasseChange;
  }, [onRepasseChange]);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const channelName = "admin-realtime-repasses";
    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cobrancas_repasses",
        },
        (payload) => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ADMIN_REPASSE_KEYS.all });
          }, 800);

          if (payload.new) {
            onRepasseChangeRef.current?.(payload.new as Partial<AdminRepasseItem>);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  return { isConnected };
}
