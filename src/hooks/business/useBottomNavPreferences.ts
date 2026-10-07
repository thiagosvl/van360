import { useCallback, useEffect, useMemo, useState } from "react";
import {
  pagesItems,
  getBottomNavHrefs,
  STORAGE_KEY_BOTTOM_NAV,
  BOTTOM_NAV_CHANGE_EVENT,
} from "@/utils/domain/pages/pagesUtils";
import { usePermissions } from "@/hooks/business/usePermissions";
import { ROUTES } from "@/constants/routes";

const DEFAULT_CUSTOMIZABLE_SLOTS: [string, string, string] = [
  ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
  ROUTES.PRIVATE.MOTORISTA.BILLING,
  ROUTES.PRIVATE.MOTORISTA.CONTRACTS,
];

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_BOTTOM_NAV}:${userId}` : STORAGE_KEY_BOTTOM_NAV;
}

function parseStoredSlots(rawValue: string | null): [string, string, string] | null {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    if (
      Array.isArray(parsed) &&
      parsed.length === 3 &&
      parsed.every((href) => typeof href === "string" && href.length > 0)
    ) {
      const unique = new Set(parsed);
      if (unique.size === 3) {
        return [parsed[0], parsed[1], parsed[2]];
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function useBottomNavPreferences(userId?: string) {
  const { isGestor, isSubConta, isMonitor, isMotoristaAuxiliar, can } = usePermissions();

  const isEligibleToCustomize = Boolean(
    isGestor && !isSubConta && !isMonitor && !isMotoristaAuxiliar
  );

  const storageKey = useMemo(() => getStorageKey(userId), [userId]);

  const readCustomSlots = useCallback((): [string, string, string] => {
    if (!isEligibleToCustomize || typeof window === "undefined") {
      return DEFAULT_CUSTOMIZABLE_SLOTS;
    }
    const raw = window.localStorage.getItem(storageKey);
    const parsed = parseStoredSlots(raw);
    return parsed ?? DEFAULT_CUSTOMIZABLE_SLOTS;
  }, [isEligibleToCustomize, storageKey]);

  const [customSlots, setCustomSlots] = useState<[string, string, string]>(readCustomSlots);

  useEffect(() => {
    setCustomSlots(readCustomSlots());
  }, [readCustomSlots]);

  useEffect(() => {
    const handleSync = () => {
      setCustomSlots(readCustomSlots());
    };

    window.addEventListener(BOTTOM_NAV_CHANGE_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(BOTTOM_NAV_CHANGE_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [readCustomSlots]);

  const activeHrefs = useMemo(() => {
    if (!isEligibleToCustomize) {
      return getBottomNavHrefs(isSubConta, isMotoristaAuxiliar, isMonitor);
    }
    return [ROUTES.PRIVATE.MOTORISTA.HOME, ...customSlots];
  }, [isEligibleToCustomize, isSubConta, isMotoristaAuxiliar, isMonitor, customSlots]);

  const availableItems = useMemo(() => {
    return pagesItems.filter((item) => {
      if (item.href === ROUTES.PRIVATE.MOTORISTA.HOME) return false;
      if (!item.permission) return true;
      return can(item.permission);
    });
  }, [can]);

  const savePreferences = useCallback(
    (slots: [string, string, string]) => {
      if (!isEligibleToCustomize || typeof window === "undefined") return;
      window.localStorage.setItem(storageKey, JSON.stringify(slots));
      setCustomSlots(slots);
      window.dispatchEvent(new Event(BOTTOM_NAV_CHANGE_EVENT));
    },
    [isEligibleToCustomize, storageKey]
  );

  const resetToDefault = useCallback(() => {
    if (!isEligibleToCustomize || typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setCustomSlots(DEFAULT_CUSTOMIZABLE_SLOTS);
    window.dispatchEvent(new Event(BOTTOM_NAV_CHANGE_EVENT));
  }, [isEligibleToCustomize, storageKey]);

  return {
    isEligibleToCustomize,
    customSlots,
    activeHrefs,
    defaultSlots: DEFAULT_CUSTOMIZABLE_SLOTS,
    availableItems,
    savePreferences,
    resetToDefault,
  };
}
