import { useContext } from "react";
import { AppLockContext, AppLockContextData } from "@/contexts/AppLockContext";
import { DEFAULT_GRACE_PERIOD_MS, GRACE_PERIOD_OPTIONS } from "@/constants";

const defaultAppLockData: AppLockContextData = {
  isSupported: false,
  deviceSecurity: null,
  isLockEnabled: false,
  gracePeriod: DEFAULT_GRACE_PERIOD_MS,
  isLocked: false,
  isAuthenticating: false,
  enableLock: async () => false,
  disableLock: async () => false,
  setGracePeriod: () => {},
  unlockApp: async () => false,
  lockApp: () => {},
  refreshSecurity: () => {},
};

export function useBiometricLock(): AppLockContextData {
  const context = useContext(AppLockContext);
  return context || defaultAppLockData;
}

export const useAppLock = useBiometricLock;

export { GRACE_PERIOD_OPTIONS, DEFAULT_GRACE_PERIOD_MS };
