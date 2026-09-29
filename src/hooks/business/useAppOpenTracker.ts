import { useEffect, useCallback } from "react";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { App, AppState } from "@capacitor/app";
import { historicoApi, RegistrarEventoDTO } from "@/services/api/historico.api";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { getDispositivoCadastro } from "@/utils/detectPlatform";
import { isImpersonating } from "@/utils/impersonate";
import { STORAGE_KEYS } from "@/constants";

const APP_OPEN_THROTTLE_MS = 15 * 60 * 1000;

let lastTrackedTimestamp = 0;
let isCurrentlyTracking = false;

export function useAppOpenTracker(usuarioId?: string) {
  const track = useCallback(async () => {
    if (!usuarioId || isImpersonating() || isCurrentlyTracking) {
      return;
    }

    const now = Date.now();

    if (now - lastTrackedTimestamp < APP_OPEN_THROTTLE_MS) {
      return;
    }

    const lastRecorded = localStorage.getItem(STORAGE_KEYS.LAST_APP_OPEN_TIMESTAMP);
    if (lastRecorded) {
      const lastTimestamp = parseInt(lastRecorded, 10);
      if (!isNaN(lastTimestamp) && now - lastTimestamp < APP_OPEN_THROTTLE_MS) {
        lastTrackedTimestamp = Math.max(lastTrackedTimestamp, lastTimestamp);
        return;
      }
    }

    isCurrentlyTracking = true;
    lastTrackedTimestamp = now;
    localStorage.setItem(STORAGE_KEYS.LAST_APP_OPEN_TIMESTAMP, now.toString());

    try {
      const payload: RegistrarEventoDTO = {
        acao: AtividadeAcao.APP_ABERTO,
        entidade_tipo: AtividadeEntidadeTipo.USUARIO,
        entidade_id: usuarioId,
        meta: {
          dispositivo: getDispositivoCadastro(),
        },
      };

      await historicoApi.registrarEvento(payload);
    } catch {
      return;
    } finally {
      isCurrentlyTracking = false;
    }
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;

    void track();

    let appListenerHandle: PluginListenerHandle | null = null;
    let removeVisibilityListener: (() => void) | null = null;

    if (Capacitor.isNativePlatform()) {
      App.addListener("appStateChange", (state: AppState) => {
        if (state.isActive) {
          void track();
        }
      }).then((handle) => {
        appListenerHandle = handle;
      });
    } else {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          void track();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      removeVisibilityListener = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    return () => {
      appListenerHandle?.remove();
      removeVisibilityListener?.();
    };
  }, [usuarioId, track]);
}
