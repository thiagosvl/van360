import { RouteExecutionMode } from "@/types/route";

const STORAGE_PREFIX = "van360_exec_order_";
const PREF_MODE_KEY = "van360_pref_start_route_mode";
const PREF_GPS_KEY = "van360_pref_start_route_gps";
const PREF_NOTIFY_KEY = "van360_pref_start_route_notify";

export const routeStorage = {
  getExecutionCustomOrder: (execucaoId: string): string[] | null => {
    if (!execucaoId || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${execucaoId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  setExecutionCustomOrder: (execucaoId: string, paradaIds: string[]): void => {
    if (!execucaoId || typeof window === "undefined") return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${execucaoId}`, JSON.stringify(paradaIds));
    } catch {}
  },

  clearExecutionCustomOrder: (execucaoId: string): void => {
    if (!execucaoId || typeof window === "undefined") return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${execucaoId}`);
    } catch {}
  },

  getPreferredStartRouteMode: (): RouteExecutionMode => {
    if (typeof window === "undefined") return "simples";
    try {
      const saved = localStorage.getItem(PREF_MODE_KEY);
      if (saved === "simples" || saved === "passo_a_passo") return saved;
      return "simples";
    } catch {
      return "simples";
    }
  },

  setPreferredStartRouteMode: (mode: RouteExecutionMode): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREF_MODE_KEY, mode);
    } catch {}
  },

  getPreferredGpsTracking: (): boolean => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem(PREF_GPS_KEY);
      return saved !== "false";
    } catch {
      return true;
    }
  },

  setPreferredGpsTracking: (enabled: boolean): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREF_GPS_KEY, String(enabled));
    } catch {}
  },

  getPreferredStepNotify: (): boolean => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem(PREF_NOTIFY_KEY);
      return saved !== "false";
    } catch {
      return true;
    }
  },

  setPreferredStepNotify: (enabled: boolean): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREF_NOTIFY_KEY, String(enabled));
    } catch {}
  }
};
