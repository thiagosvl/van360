import { createContext } from "react";
import { DeviceSecurityCheck } from "@/services/native/biometricAuth.service";

export interface AppLockContextData {
  isSupported: boolean;
  deviceSecurity: DeviceSecurityCheck | null;
  isLockEnabled: boolean;
  gracePeriod: number;
  isLocked: boolean;
  isAuthenticating: boolean;
  enableLock: () => Promise<boolean>;
  disableLock: () => Promise<boolean>;
  setGracePeriod: (periodMs: number) => void;
  unlockApp: () => Promise<boolean>;
  lockApp: () => void;
  refreshSecurity: () => void;
}

export const AppLockContext = createContext<AppLockContextData | undefined>(undefined);
