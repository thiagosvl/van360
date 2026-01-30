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

    if (isProfissional) {
      // 1. Check if PIX is validated first (Contract Guard depends on PIX Guard)
      const isPixKeyValidated = profile.status_chave_pix === PixKeyStatus.VALIDADA;
      if (!isPixKeyValidated) return;

      // 2. Check if contract is configured (prefer flag from summary/profile.flags)
      const isContractConfigured = profile.flags?.contrato_configurado ?? profile.config_contrato?.configurado === true;
      
      const shouldBlock = !isContractConfigured;

      if (!shouldBlock) {
          return;
      }

      // 3. Trigger modal if on a new path
      if (triggeredPath !== location.pathname) {
          onShouldOpen();
          setTriggeredPath(location.pathname);
      }
    }
  }, [profile, isProfissional, isLoading, onShouldOpen, location.pathname, triggeredPath]);
}
