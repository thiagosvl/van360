import { PixKeyStatus } from "@/types/enums";
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
      const hasPixKeyProfile = !!profile.chave_pix;
      const isPixKeyValidated = profile.status_chave_pix === PixKeyStatus.VALIDADA;

      // Se tem chave MAS não está validada -> Bloqueia
      // Se NÃO tem chave -> Bloqueia (comportamento antigo, mas reforçado)
      
      const shouldBlock = !hasPixKeyProfile || !isPixKeyValidated;

      if (!shouldBlock) {
          return; 
      }

      // Se chegamos aqui, PRECISA bloquear/abrir dialog
      


      // Only trigger if we haven't triggered for this specific path check yet
      if (triggeredPath !== location.pathname) {
          // Se a chave existe mas está pendente/falha, ou se não existe, chamamos o onShouldOpen
          // O LayoutContext vai decidir se pode fechar ou não (agora vamos mudar lá pra canClose: false)
          onShouldOpen();
          setTriggeredPath(location.pathname);
      }
    }
  }, [profile, isProfissional, isLoading, onShouldOpen, location.pathname, triggeredPath]);

  // No return needed, this hook is a side-effect manager
}
