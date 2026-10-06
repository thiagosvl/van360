import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Capacitor } from "@capacitor/core";
import { App, AppState } from "@capacitor/app";
import { STORAGE_KEYS, DEFAULT_GRACE_PERIOD_MS } from "@/constants";
import {
  biometricAuthService,
  DeviceSecurityCheck,
} from "@/services/native/biometricAuth.service";
import { useSession } from "@/hooks/business/useSession";
import { AppLockContext, AppLockContextData } from "./AppLockContext";

export function AppLockProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const isNative = Capacitor.isNativePlatform();

  const [deviceSecurity, setDeviceSecurity] = useState<DeviceSecurityCheck | null>(null);
  const [isLockEnabled, setIsLockEnabled] = useState<boolean>(() => {
    if (!isNative) return false;
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC_LOCK_ENABLED) === "true";
  });

  const [gracePeriod, setGracePeriodState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_LOCK_GRACE_PERIOD);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return DEFAULT_GRACE_PERIOD_MS;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (!isNative) return false;
    const enabled = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_LOCK_ENABLED) === "true";
    return enabled;
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isAuthenticatingRef = useRef(false);
  const isInitialCheckDoneRef = useRef(false);

  const refreshSecurity = useCallback(() => {
    if (!isNative) return;
    biometricAuthService.checkAvailability().then((result) => {
      setDeviceSecurity(result);
      if (!result.deviceIsSecure && !result.hasBiometrics) {
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_LOCK_ENABLED);
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_LOCK_LAST_BACKGROUND);
        setIsLockEnabled(false);
        setIsLocked(false);
      }
    });
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;
    refreshSecurity();

    let handle: { remove: () => void } | null = null;
    App.addListener("appStateChange", (state: AppState) => {
      if (state.isActive) {
        refreshSecurity();
      }
    }).then((listenerHandle) => {
      handle = listenerHandle;
    });

    return () => {
      handle?.remove();
    };
  }, [isNative, refreshSecurity]);

  const unlockApp = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      setIsLocked(false);
      return true;
    }

    if (isAuthenticatingRef.current) return false;

    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);

    try {
      const result = await biometricAuthService.authenticate();
      if (result.success) {
        setIsLocked(false);
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_LOCK_LAST_BACKGROUND);
        return true;
      }
      return false;
    } finally {
      isAuthenticatingRef.current = false;
      setIsAuthenticating(false);
    }
  }, [isNative]);

  const lockApp = useCallback(() => {
    if (!isNative || !isLockEnabled) return;
    setIsLocked(true);
  }, [isNative, isLockEnabled]);

  const enableLock = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);
    try {
      const result = await biometricAuthService.authenticate(
        "Confirme sua identidade para ativar o bloqueio do app"
      );
      if (result.success) {
        localStorage.setItem(STORAGE_KEYS.BIOMETRIC_LOCK_ENABLED, "true");
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_LOCK_LAST_BACKGROUND);
        isInitialCheckDoneRef.current = true;
        setIsLockEnabled(true);
        setIsLocked(false);
        return true;
      }
      return false;
    } finally {
      isAuthenticatingRef.current = false;
      setIsAuthenticating(false);
    }
  }, [isNative]);

  const disableLock = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);
    try {
      const result = await biometricAuthService.authenticate(
        "Confirme sua identidade para desativar o bloqueio do app"
      );
      if (result.success) {
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_LOCK_ENABLED);
        localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_LOCK_LAST_BACKGROUND);
        setIsLockEnabled(false);
        setIsLocked(false);
        return true;
      }
      return false;
    } finally {
      isAuthenticatingRef.current = false;
      setIsAuthenticating(false);
    }
  }, [isNative]);

  const setGracePeriod = useCallback((periodMs: number) => {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_LOCK_GRACE_PERIOD, String(periodMs));
    setGracePeriodState(periodMs);
  }, []);

  useEffect(() => {
    if (!session) {
      setIsLocked(false);
      return;
    }

    if (!isInitialCheckDoneRef.current) {
      isInitialCheckDoneRef.current = true;
      if (isNative && isLockEnabled) {
        setIsLocked(true);
        void unlockApp();
      }
    }
  }, [session, isNative, isLockEnabled, unlockApp]);

  useEffect(() => {
    if (!isNative || !session || !isLockEnabled) return;

    let handle: { remove: () => void } | null = null;

    App.addListener("appStateChange", (state: AppState) => {
      if (isAuthenticatingRef.current) return;
      const now = Date.now();

      if (!state.isActive) {
        localStorage.setItem(STORAGE_KEYS.BIOMETRIC_LOCK_LAST_BACKGROUND, String(now));
        if (gracePeriod === 0) {
          setIsLocked(true);
        }
        return;
      }

      const lastBackgroundStr = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_LOCK_LAST_BACKGROUND);
      if (!lastBackgroundStr) return;

      const lastBackground = parseInt(lastBackgroundStr, 10);
      if (isNaN(lastBackground)) return;

      const elapsed = now - lastBackground;
      if (elapsed >= gracePeriod) {
        setIsLocked(true);
        void unlockApp();
      }
    }).then((listenerHandle) => {
      handle = listenerHandle;
    });

    return () => {
      handle?.remove();
    };
  }, [isNative, session, isLockEnabled, gracePeriod, unlockApp]);

  const value = useMemo<AppLockContextData>(() => ({
    isSupported: isNative,
    deviceSecurity,
    isLockEnabled,
    gracePeriod,
    isLocked: isNative && !!session && isLockEnabled && isLocked,
    isAuthenticating,
    enableLock,
    disableLock,
    setGracePeriod,
    unlockApp,
    lockApp,
    refreshSecurity,
  }), [
    isNative,
    deviceSecurity,
    isLockEnabled,
    gracePeriod,
    isLocked,
    session,
    isAuthenticating,
    enableLock,
    disableLock,
    setGracePeriod,
    unlockApp,
    lockApp,
    refreshSecurity,
  ]);

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}
