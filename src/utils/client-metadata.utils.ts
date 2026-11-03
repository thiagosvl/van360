import { getDispositivoCadastro } from "./detectPlatform";
import { getStoredAttribution } from "@/hooks/business/useAttribution";
import { DispositivoCadastro } from "@/types/enums";

export interface ClientRegistrationMetadataPayload {
  dispositivo_cadastro: DispositivoCadastro;
  metadados_cadastro: Record<string, unknown>;
}

function readMetaPixelCookies(): { fbp?: string; fbc?: string } | undefined {
  if (typeof document === "undefined" || !document.cookie) return undefined;
  const read = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  };
  const fbp = read("_fbp");
  const fbc = read("_fbc");
  return fbp || fbc ? { fbp, fbc } : undefined;
}

export function collectClientRegistrationMetadata(
  extra?: Record<string, unknown>
): ClientRegistrationMetadataPayload {
  const dispositivo_cadastro = getDispositivoCadastro();
  const attribution = getStoredAttribution();

  const isBrowser = typeof window !== "undefined";

  const rawReferrer = isBrowser && document.referrer ? document.referrer : undefined;
  const isInternalReferrer = Boolean(
    rawReferrer && (
      rawReferrer.startsWith(window.location.origin) ||
      rawReferrer.includes("app.van360.com.br") ||
      rawReferrer.includes("localhost") ||
      rawReferrer.includes("capacitor://")
    )
  );
  const cleanReferrer = isInternalReferrer ? undefined : rawReferrer;
  const finalReferrer = attribution?.referrer || cleanReferrer;

  const metadados_cadastro: Record<string, unknown> = {
    screen: isBrowser && window.screen ? `${window.screen.width}x${window.screen.height}` : undefined,
    language: typeof navigator !== "undefined" ? navigator.language : undefined,
    timezone: isBrowser ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
    referrer: finalReferrer,
    utm: attribution?.utm || undefined,
    meta: readMetaPixelCookies(),
    ...extra,
  };

  return {
    dispositivo_cadastro,
    metadados_cadastro,
  };
}
