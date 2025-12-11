import { PlanoData } from "@/utils/domain/plano/accessRules";
import { useMemo } from "react";

interface UsePassengerLimitsProps {
  // We accept either the processed 'plano' object OR 'profile' data
  // Ideally 'plano' is enough for flags, but 'profile' is needed for the numeric limit currently
  plano: PlanoData | null;
  profile?: any; // Using any for profile to avoid deep type dependencies circularity if possible, but better to import type if easy
  currentCount: number | null | undefined;
}

export function usePassengerLimits({
  plano,
  profile,
  currentCount,
}: UsePassengerLimitsProps) {
  return useMemo(() => {
    // Extract limit from profile (subscription -> plan -> limit)
    // Fallback to null if not found
    const limitePassageiros =
      profile?.assinaturas_usuarios?.[0]?.planos?.limite_passageiros ?? null;

    const count = currentCount ?? 0;

    const restantePassageiros =
      limitePassageiros == null
        ? null
        : Number(limitePassageiros) - count;

    // A user is "limited" if they are on a Free Plan (usually)
    // Or we could check if a limit exists numerically?
    // The original logic was: const isLimitedUser = !!plano && plano.isFreePlan;
    const isLimitedUser = !!plano && plano.isFreePlan;

    const isLimitReached =
      typeof restantePassageiros === "number" && restantePassageiros <= 0;

    return {
      limitePassageiros,
      restantePassageiros,
      isLimitedUser, // Can display upgrade prompts
      isLimitReached, // Should block actions or show specific warning
      count,
    };
  }, [plano, profile, currentCount]);
}
