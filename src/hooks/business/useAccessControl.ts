import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import {
    canViewGastos,
    canViewRelatorios,
    hasPassageirosLimit,
} from "@/utils/domain/plano/accessRules";

export const useAccessControl = () => {
  const { user } = useSession();
  const { profile, isLoading, plano } = useProfile(user?.id);

  // Permission Flags
  const permissions = {
    canViewRelatorios: canViewRelatorios(plano),
    canViewGastos: canViewGastos(plano),
    isFreePlan: plano?.isFreePlan ?? false,
  };

  // Limits
  const passageirosLimit =
    plano?.planoCompleto?.limite_passageiros ||
    profile?.assinaturas_usuarios?.[0]?.planos?.limite_passageiros ||
    null;

  const hasPassengerLimit = hasPassageirosLimit(plano);

  // Helper Checks
  const checkPassengerLimit = (currentCount: number): boolean => {
    if (!hasPassengerLimit || passageirosLimit === null) return false;
    return currentCount >= Number(passageirosLimit);
  };

  return {
    isLoading,
    profile,
    plano,
    permissions,
    limits: {
      passageiros: passageirosLimit,
      hasPassengerLimit,
    },
    checks: {
      checkPassengerLimit,
    },
  };
};
