import { useEffect, useCallback, useRef } from "react";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { App, AppState } from "@capacitor/app";
import { historicoApi, RegistrarEventoDTO } from "@/services/api/historico.api";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { getDispositivoCadastro } from "@/utils/detectPlatform";
import { isImpersonating } from "@/utils/impersonate";

const STORAGE_KEY_LAST_APP_OPEN = "van360_last_app_open_timestamp";
const APP_OPEN_THROTTLE_MS = 15 * 60 * 1000;

export function useAppOpenTracker(usuarioId?: string) {
  const isExecutingRef = useRef(false);

  const track = useCallback(async () => {
    if (!usuarioId || isImpersonating() || isExecutingRef.current) {
      return;
    }

    try {
      const now = Date.now();
      const lastRecorded = localStorage.getItem(STORAGE_KEY_LAST_APP_OPEN);

      if (lastRecorded) {
        const lastTimestamp = parseInt(lastRecorded, 10);
        if (!isNaN(lastTimestamp) && now - lastTimestamp < APP_OPEN_THROTTLE_MS) {
          return;
        }
      }

      isExecutingRef.current = true;

      const payload: RegistrarEventoDTO = {
        acao: AtividadeAcao.APP_ABERTO,
        entidade_tipo: AtividadeEntidadeTipo.USUARIO,
        entidade_id: usuarioId,
        meta: {
          dispositivo: getDispositivoCadastro(),
        },
      };

      await historicoApi.registrarEvento(payload);
      localStorage.setItem(STORAGE_KEY_LAST_APP_OPEN, Date.now().toString());
    } catch {
      return;
    } finally {
      isExecutingRef.current = false;
    }
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;

    void track();

    let appListenerHandle: PluginListenerHandle | null = null;

    if (Capacitor.isNativePlatform()) {
      App.addListener("appStateChange", (state: AppState) => {
        if (state.isActive) {
          void track();
        }
      }).then((handle) => {
        appListenerHandle = handle;
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void track();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      appListenerHandle?.remove();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [usuarioId, track]);
}
