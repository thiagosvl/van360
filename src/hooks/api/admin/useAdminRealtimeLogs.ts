import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { AdminUserLogItem } from "@/services/api/admin/admin-log.api";

interface UseAdminRealtimeLogsOptions {
  enabled?: boolean;
  onNewLog?: (log: Partial<AdminUserLogItem>) => void;
}

export function useAdminRealtimeLogs({
  enabled = true,
  onNewLog,
}: UseAdminRealtimeLogsOptions = {}) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onNewLogRef = useRef(onNewLog);

  useEffect(() => {
    onNewLogRef.current = onNewLog;
  }, [onNewLog]);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const channelName = "admin-realtime-logs";
    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "historico_atividades",
        },
        (payload) => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "users", "latest-activity"] });
          }, 800);

          if (payload.new) {
            onNewLogRef.current?.(payload.new as Partial<AdminUserLogItem>);
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
