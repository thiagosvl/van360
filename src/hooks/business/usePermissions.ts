import { useCallback } from "react";
import { useSession } from "./useSession";
import { useProfile } from "./useProfile";
import { hasPermission, PermissionKey, PERMISSIONS } from "@/config/permissions";
import { UserType } from "@/types/enums";
import {
  isMotoristaTitular,
  isMotoristaAuxiliar as checkIsMotoristaAuxiliar,
  isMonitor as checkIsMonitor,
  isSubConta as checkIsSubConta,
} from "@/utils/userUtils";
import { isRenovacaoDisponivel } from "@/utils/domain/renovacao/renovacaoDisponibilidade";

export function usePermissions() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const can = useCallback(
    (permission: PermissionKey): boolean => {
      const role = profile?.tipo as UserType | undefined;
      if (permission === PERMISSIONS.RENOVACOES_GERENCIAR && !isRenovacaoDisponivel([profile?.id, user?.id])) {
        return false;
      }
      return hasPermission(role, permission);
    },
    [profile?.tipo, profile?.id, user?.id]
  );

  return {
    can,
    role: profile?.tipo as UserType | undefined,
    isGestor: isMotoristaTitular(profile),
    isMotoristaAuxiliar: checkIsMotoristaAuxiliar(profile),
    isMonitor: checkIsMonitor(profile),
    isSubConta: checkIsSubConta(profile),
  };
}
