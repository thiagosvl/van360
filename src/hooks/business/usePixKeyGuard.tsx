import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { Usuario } from "@/types/usuario";
import { useEffect, useState } from "react";

export function usePixKeyGuard(
  profile: Usuario | null | undefined,
  isProfissional: boolean,
  isLoading: boolean
) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

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
        if (!hasPixKeyLocal && !hasChecked) {
            setIsOpen(true);
            setHasChecked(true); 
        }
      }
    }
  }, [profile, isProfissional, isLoading, hasChecked]);

  return { 
    isOpen, 
    setIsOpen,
    onSuccess: () => {
        const storageRaw = localStorage.getItem(STORAGE_KEY_QUICKSTART_STATUS);
        const storageObj = storageRaw ? JSON.parse(storageRaw) : {};
        localStorage.setItem(STORAGE_KEY_QUICKSTART_STATUS, JSON.stringify({
            ...storageObj,
            step_pix: true
        }));
    }
  };
}
