import { Usuario } from "@/types/usuario";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface UseContractGuardProps {
  profile: Usuario | null;
  isLoading: boolean;
  onShouldOpen: () => void;
  disabled?: boolean;
}

/**
 * Hook que verifica se o usuário configurou as definições de contrato.
 * Se não, ele dispara o callback onShouldOpen.
 */
export function useContractGuard({
  profile,
  isLoading,
  onShouldOpen,
  disabled
}: UseContractGuardProps) {
  const location = useLocation();
  const [triggeredPath, setTriggeredPath] = useState<string | null>(null);

  useEffect(() => {
    if (disabled || isLoading || !profile) return;

    // 1. Verifica se o contrato está configurado
    // Priorizamos a configuração do banco de dados (config_contrato) sobre a flag
    const isContractConfigured = profile.config_contrato?.configurado === true || profile.flags?.contrato_configurado === true;

    // 2. Determina se deve bloquear
    const shouldBlock = !isContractConfigured;

    if (!shouldBlock) {
        return;
    }

    // 3. Dispara o modal se estiver em um novo path
    if (triggeredPath !== location.pathname) {
        setTriggeredPath(location.pathname);
        onShouldOpen();
    }
  }, [profile, isLoading, onShouldOpen, location.pathname, triggeredPath, disabled]);
}
