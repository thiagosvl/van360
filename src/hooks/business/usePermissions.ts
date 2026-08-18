import { useCallback } from "react";
import { useSession } from "./useSession";
import { useProfile } from "./useProfile";
import { hasPermission, PermissionKey } from "@/config/permissions";
import { UserType } from "@/types/enums";
import {
  isMotoristaTitular,
  isMotoristaAuxiliar as checkIsMotoristaAuxiliar,
  isMonitor as checkIsMonitor,
  isSubConta as checkIsSubConta,
} from "@/utils/userUtils";

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
    isGestor: isMotoristaTitular(profile),
    isMotoristaAuxiliar: checkIsMotoristaAuxiliar(profile),
    isMonitor: checkIsMonitor(profile),
    isSubConta: checkIsSubConta(profile),
  };
}
