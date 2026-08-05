import { useCallback } from "react";
import { useSession } from "./useSession";
import { useProfile } from "./useProfile";
import { hasPermission, PermissionKey } from "@/config/permissions";
import { UserType } from "@/types/enums";

export function usePermissions() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const can = useCallback(
    (permission: PermissionKey): boolean => {
      const role = profile?.tipo as UserType | undefined;
      return hasPermission(role, permission);
    },
    [profile?.tipo]
  );

  return {
    can,
    role: profile?.tipo as UserType | undefined,
    isGestor: profile?.tipo === UserType.MOTORISTA,
    isMotoristaAuxiliar: profile?.tipo === UserType.MOTORISTA_AUXILIAR,
    isMonitor: profile?.tipo === UserType.MONITOR,
    isSubConta: Boolean(profile?.conta_pai_id),
  };
}
