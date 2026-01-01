import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { Usuario } from "@/types/usuario";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface UsePixKeyGuardProps {
    profile: Usuario | null | undefined;
    isProfissional: boolean;
    isLoading: boolean;
    onShouldOpen: () => void;
}

export function usePixKeyGuard({
  profile,
  isProfissional,
  isLoading,
  onShouldOpen
}: UsePixKeyGuardProps) {
  const location = useLocation();
  const [triggeredPath, setTriggeredPath] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !profile) return;

    // Check only if it's the professional plan
    if (isProfissional) {
      // Parse current storage
      const storageRaw = localStorage.getItem(STORAGE_KEY_QUICKSTART_STATUS);
      const storageObj = storageRaw ? JSON.parse(storageRaw) : {};
      const hasPixKeyLocal = !!storageObj.step_pix;
      
      const hasPixKeyProfile = !!profile.chave_pix;

      // Sync local storage if profile has key
      if (hasPixKeyProfile) {
        if (!hasPixKeyLocal) {
            localStorage.setItem(STORAGE_KEY_QUICKSTART_STATUS, JSON.stringify({
                ...storageObj,
                step_pix: true
            }));
        }
      } else {
        if (!hasPixKeyLocal) {
            // Check if we are on the Home screen ('/inicio' or '/')
            const isHomePage = location.pathname === '/inicio' || location.pathname === '/';

            if (!isHomePage) {
                // If not on home, reset the trigger so it can fire again when returning to home
                if (triggeredPath) {
                    setTriggeredPath(null);
                }
                return;
            }

            // Only trigger if we haven't triggered for this specific path check yet
            if (triggeredPath !== location.pathname) {
                onShouldOpen();
                setTriggeredPath(location.pathname);
            }
        }
      }
    }
  }, [profile, isProfissional, isLoading, onShouldOpen, location.pathname, triggeredPath]);

  // No return needed, this hook is a side-effect manager
}
