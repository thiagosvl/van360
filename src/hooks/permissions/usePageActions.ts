import { useMemo } from "react";
import { useProfile } from "@/hooks/business/useProfile";
import { enablePageActions } from "@/utils/domain/pages/pagesUtils";

/**
 * Hook para verificar se ações de uma página estão habilitadas baseado no plano
 */
export function usePageActions(href: string) {
  const { plano } = useProfile();

  const enabled = useMemo(() => {
    if (!plano) return false;
    return enablePageActions(href, plano);
  }, [href, plano]);

  return { enabled };
}

