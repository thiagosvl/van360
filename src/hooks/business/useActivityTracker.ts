import { useCallback } from "react";
import { historicoApi, RegistrarEventoDTO } from "@/services/api/historico.api";
import { sessionManager } from "@/services/sessionManager";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { getDispositivoCadastro } from "@/utils/detectPlatform";
import { isImpersonating } from "@/utils/impersonate";
import { STORAGE_KEYS } from "@/constants";

const APP_OPEN_THROTTLE_MS = 15 * 60 * 1000;

export interface TrackActivityOptions {
  entidadeTipo?: AtividadeEntidadeTipo;
  entidadeId?: string;
  descricao?: string;
  meta?: Record<string, unknown>;
}

export function useActivityTracker() {
  const trackActivity = useCallback((acao: AtividadeAcao, options?: TrackActivityOptions) => {
    if (isImpersonating()) {
      return;
    }

    const payload: RegistrarEventoDTO = {
      acao,
      entidade_tipo: options?.entidadeTipo,
      entidade_id: options?.entidadeId,
      descricao: options?.descricao,
      meta: options?.meta,
    };

    historicoApi.registrarEvento(payload).catch(() => { });
  }, []);

  const trackAppOpen = useCallback(async (usuarioId?: string) => {
    if (!usuarioId || isImpersonating()) return;

    try {
      const now = Date.now();
      const lastRecorded = localStorage.getItem(STORAGE_KEYS.LAST_APP_OPEN_TIMESTAMP);

      if (lastRecorded) {
        const lastTimestamp = parseInt(lastRecorded, 10);
        if (!isNaN(lastTimestamp) && now - lastTimestamp < APP_OPEN_THROTTLE_MS) {
          return;
        }
      }

      const currentSession = sessionManager.getCurrentSession();
      let token = currentSession?.access_token;

      if (!token) {
        const { data } = await sessionManager.getSession();
        token = data.session?.access_token;
      }

      if (!token) return;

      const dispositivo = getDispositivoCadastro();

      const payload: RegistrarEventoDTO = {
        acao: AtividadeAcao.APP_ABERTO,
        entidade_tipo: AtividadeEntidadeTipo.USUARIO,
        entidade_id: usuarioId,
        meta: {
          dispositivo,
        },
      };

      await historicoApi.registrarEvento(payload);
      localStorage.setItem(STORAGE_KEYS.LAST_APP_OPEN_TIMESTAMP, now.toString());
    } catch {
      return;
    }
  }, []);

  return {
    trackActivity,
    trackAppOpen,
  };
}
