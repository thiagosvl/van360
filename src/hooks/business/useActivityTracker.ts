import { useCallback } from "react";
import { historicoApi, RegistrarEventoDTO } from "@/services/api/historico.api";
import { AtividadeAcao, AtividadeEntidadeTipo, DispositivoCadastro } from "@/types/enums";
import { getDispositivoCadastro } from "@/utils/detectPlatform";
import { isImpersonating } from "@/utils/impersonate";

const STORAGE_KEY_LAST_APP_OPEN = "van360_last_app_open_timestamp";
const APP_OPEN_THROTTLE_MS = 15 * 60 * 1000;

function resolveDescricaoAcesso(dispositivo: DispositivoCadastro): string {
  switch (dispositivo) {
    case DispositivoCadastro.APP_ANDROID:
    case DispositivoCadastro.APP_IOS:
      return "Acesso registrado via aplicativo móvel.";
    case DispositivoCadastro.WEB_DESKTOP:
      return "Acesso registrado via navegador (computador).";
    case DispositivoCadastro.WEB_MOBILE_ANDROID:
    case DispositivoCadastro.WEB_MOBILE_IOS:
      return "Acesso registrado via navegador (celular).";
    default:
      return "Acesso ao sistema registrado.";
  }
}

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

    historicoApi.registrarEvento(payload).catch(() => {});
  }, []);

  const trackAppOpen = useCallback((usuarioId?: string) => {
    if (!usuarioId || isImpersonating()) return;

    try {
      const now = Date.now();
      const lastRecorded = localStorage.getItem(STORAGE_KEY_LAST_APP_OPEN);

      if (lastRecorded) {
        const lastTimestamp = parseInt(lastRecorded, 10);
        if (!isNaN(lastTimestamp) && now - lastTimestamp < APP_OPEN_THROTTLE_MS) {
          return;
        }
      }

      localStorage.setItem(STORAGE_KEY_LAST_APP_OPEN, now.toString());

      const dispositivo = getDispositivoCadastro();

      const payload: RegistrarEventoDTO = {
        acao: AtividadeAcao.APP_ABERTO,
        entidade_tipo: AtividadeEntidadeTipo.USUARIO,
        entidade_id: usuarioId,
        descricao: resolveDescricaoAcesso(dispositivo),
        meta: {
          dispositivo,
        },
      };

      historicoApi.registrarEvento(payload).catch(() => {});
    } catch {
      return;
    }
  }, []);

  return {
    trackActivity,
    trackAppOpen,
  };
}
