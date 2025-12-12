import { usePermissions } from "@/hooks/business/usePermissions";
import { enablePageActions } from "@/utils/domain/pages/pagesUtils";
import { useMemo } from "react";

/**
 * Hook para verificar se ações de uma página estão habilitadas baseado no plano
 */
export function usePageActions(href: string) {
  const { plano, role } = usePermissions();

  const enabled = useMemo(() => {
    if (!plano) return false;
    return enablePageActions(href, plano, role);
  }, [href, plano, role]);

  return { enabled };
}

