import { Capacitor } from "@capacitor/core";
import { AppLockOverlay } from "@/components/features/security/AppLockOverlay";

export function AppLockController() {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return <AppLockOverlay />;
}

export default AppLockController;
