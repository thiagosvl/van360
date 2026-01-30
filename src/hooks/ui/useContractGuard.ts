import { PixKeyStatus } from "@/types/enums";
import { Usuario } from "@/types/usuario";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface UseContractGuardProps {
  profile: Usuario | null;
  isProfissional: boolean;
  isLoading: boolean;
  onShouldOpen: () => void;
}

/**
 * Hook that checks if a professional user has configured their contract settings.
 * If not, it triggers the onShouldOpen callback.
 * It should only trigger AFTER the PIX key is validated.
 */
export function useContractGuard({
  profile,
  isProfissional,
  isLoading,
  onShouldOpen
}: UseContractGuardProps) {
  const location = useLocation();
  const [triggeredPath, setTriggeredPath] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !profile) return;

    // 1. Check basic prerequisites
    const isContractConfigured = profile.flags?.contrato_configurado ?? profile.config_contrato?.configurado === true;
    const isPixKeyValidated = profile.status_chave_pix === PixKeyStatus.VALIDADA;

    // 2. Determine if we should block based on plan rules
    let shouldBlock = false;

    if (!isContractConfigured) {
        if (isProfissional) {
            // Profissional: Must have PIX validated before worrying about contracts
            if (isPixKeyValidated) {
                shouldBlock = true;
            }
        } else {
            // Essential (or others): Block immediately if not configured (no PIX dependency for this specific guard)
            shouldBlock = true;
        }
    }

    if (!shouldBlock) {
        return;
    }

    // 3. Trigger modal if on a new path
    if (triggeredPath !== location.pathname) {
        onShouldOpen();
        setTriggeredPath(location.pathname);
    }
  }, [profile, isLoading, onShouldOpen, location.pathname, triggeredPath]);
}
