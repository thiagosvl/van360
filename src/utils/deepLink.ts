import { STORAGE_KEYS } from "@/constants";
import { ROUTES } from "@/constants/routes";

interface PendingDeepLinkPayload {
  url: string;
  timestamp: number;
}

const MAX_DEEP_LINK_TTL_MS = 60 * 1000;

export function normalizeNotificationRoute(rawUrlOrPath: string): string {
  if (!rawUrlOrPath || typeof rawUrlOrPath !== "string") {
    return ROUTES.PRIVATE.MOTORISTA.HOME;
  }

  let resolvedPath = rawUrlOrPath.trim();

  if (resolvedPath.startsWith("http://") || resolvedPath.startsWith("https://")) {
    try {
      const parsedUrl = new URL(resolvedPath);
      resolvedPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      resolvedPath = rawUrlOrPath;
    }
  }

  if (resolvedPath.startsWith("/passageiros")) {
    resolvedPath = resolvedPath.replace(/^\/passageiros/, ROUTES.PRIVATE.MOTORISTA.PASSENGERS);
  }

  return resolvedPath || ROUTES.PRIVATE.MOTORISTA.HOME;
}

export function savePendingDeepLink(targetUrl: string): void {
  if (!targetUrl) return;

  try {
    const payload: PendingDeepLinkPayload = {
      url: normalizeNotificationRoute(targetUrl),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.PENDING_DEEP_LINK, JSON.stringify(payload));
  } catch {
  }
}

export function getPendingDeepLink(): string | null {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.PENDING_DEEP_LINK);
    if (!rawData) return null;

    const parsed: PendingDeepLinkPayload = JSON.parse(rawData);
    if (!parsed || typeof parsed.url !== "string" || typeof parsed.timestamp !== "number") {
      localStorage.removeItem(STORAGE_KEYS.PENDING_DEEP_LINK);
      return null;
    }

    if (Date.now() - parsed.timestamp > MAX_DEEP_LINK_TTL_MS) {
      localStorage.removeItem(STORAGE_KEYS.PENDING_DEEP_LINK);
      return null;
    }

    return parsed.url;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.PENDING_DEEP_LINK);
    return null;
  }
}

export function clearPendingDeepLink(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_DEEP_LINK);
  } catch {
  }
}

export function consumePendingDeepLink(): string | null {
  const pendingUrl = getPendingDeepLink();
  if (pendingUrl) {
    clearPendingDeepLink();
  }
  return pendingUrl;
}
