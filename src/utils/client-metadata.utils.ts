import { getDispositivoCadastro } from "./detectPlatform";
import { getStoredAttribution } from "@/hooks/business/useAttribution";
import { DispositivoCadastro } from "@/types/enums";

export interface ClientRegistrationMetadataPayload {
  dispositivo_cadastro: DispositivoCadastro;
  metadados_cadastro: Record<string, unknown>;
}

export function collectClientRegistrationMetadata(
  extra?: Record<string, unknown>
): ClientRegistrationMetadataPayload {
  const dispositivo_cadastro = getDispositivoCadastro();
  const attribution = getStoredAttribution();

  const isBrowser = typeof window !== "undefined";

  const metadados_cadastro: Record<string, unknown> = {
    screen: isBrowser && window.screen ? `${window.screen.width}x${window.screen.height}` : undefined,
    language: typeof navigator !== "undefined" ? navigator.language : undefined,
    timezone: isBrowser ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
    referrer: isBrowser && document.referrer ? document.referrer : attribution?.referrer || undefined,
    utm: attribution?.utm || undefined,
    ...extra,
  };

  return {
    dispositivo_cadastro,
    metadados_cadastro,
  };
}
