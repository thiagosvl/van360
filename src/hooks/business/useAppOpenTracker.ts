import { useEffect, useCallback, useRef } from "react";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { App, AppState } from "@capacitor/app";
import { historicoApi, RegistrarEventoDTO } from "@/services/api/historico.api";
import { sessionManager } from "@/services/sessionManager";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { getDispositivoCadastro } from "@/utils/detectPlatform";
import { isImpersonating } from "@/utils/impersonate";
import { STORAGE_KEYS } from "@/constants";

const APP_OPEN_THROTTLE_MS = 15 * 60 * 1000;
const RETRY_DELAY_MS = 5000;
const MAX_CONSECUTIVE_RETRIES = 3;

export function useAppOpenTracker(usuarioId?: string) {
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const isTrackingRef = useRef(false);
  const lastTrackedTimestampRef = useRef(0);

  const getStorageKey = useCallback((id: string) => {
    return `${STORAGE_KEYS.LAST_APP_OPEN_TIMESTAMP}_${id}`;
  }, []);

  const track = useCallback(async () => {
    if (!usuarioId || isImpersonating() || isTrackingRef.current) {
      return;
    }

    const now = Date.now();

    if (now - lastTrackedTimestampRef.current < APP_OPEN_THROTTLE_MS) {
      return;
    }

    const storageKey = getStorageKey(usuarioId);
    const lastRecorded = localStorage.getItem(storageKey);
    if (lastRecorded) {
      const lastTimestamp = parseInt(lastRecorded, 10);
      if (!isNaN(lastTimestamp) && now - lastTimestamp < APP_OPEN_THROTTLE_MS) {
        lastTrackedTimestampRef.current = Math.max(lastTrackedTimestampRef.current, lastTimestamp);
        return;
      }
    }

    isTrackingRef.current = true;
    lastTrackedTimestampRef.current = now;

    try {
      const { data } = await sessionManager.getSession();
      const token = data.session?.access_token;

      if (!token) {
        lastTrackedTimestampRef.current = 0;
        if (consecutiveFailuresRef.current < MAX_CONSECUTIVE_RETRIES) {
          consecutiveFailuresRef.current += 1;
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(() => {
            void track();
          }, RETRY_DELAY_MS);
        }
        return;
      }

      const payload: RegistrarEventoDTO = {
        acao: AtividadeAcao.APP_ABERTO,
        entidade_tipo: AtividadeEntidadeTipo.USUARIO,
        entidade_id: usuarioId,
        meta: {
          dispositivo: getDispositivoCadastro(),
        },
      };

      await historicoApi.registrarEvento(payload);

      consecutiveFailuresRef.current = 0;
      localStorage.setItem(storageKey, now.toString());
    } catch {
      lastTrackedTimestampRef.current = 0;
      if (consecutiveFailuresRef.current < MAX_CONSECUTIVE_RETRIES) {
        consecutiveFailuresRef.current += 1;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          void track();
        }, RETRY_DELAY_MS);
      }
    } finally {
      isTrackingRef.current = false;
    }
  }, [usuarioId, getStorageKey]);

  useEffect(() => {
    if (!usuarioId) return;

    void track();

    let appListenerHandle: PluginListenerHandle | null = null;
    let removeVisibilityListener: (() => void) | null = null;

    const handleOnline = () => {
      consecutiveFailuresRef.current = 0;
      void track();
    };

    window.addEventListener("online", handleOnline);

    const heartbeatInterval = setInterval(() => {
      void track();
    }, APP_OPEN_THROTTLE_MS);

    if (Capacitor.isNativePlatform()) {
      App.addListener("appStateChange", (state: AppState) => {
        if (state.isActive) {
          consecutiveFailuresRef.current = 0;
          void track();
        }
      }).then((handle) => {
        appListenerHandle = handle;
      });
    } else {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          consecutiveFailuresRef.current = 0;
          void track();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      removeVisibilityListener = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      clearInterval(heartbeatInterval);
      window.removeEventListener("online", handleOnline);
      appListenerHandle?.remove();
      removeVisibilityListener?.();
    };
  }, [usuarioId, track]);
}
