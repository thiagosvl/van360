import { PlanoData } from "@/utils/domain/plano/accessRules";
import { useMemo } from "react";
import { usePassageiroContagem } from "../api/usePassageiroContagem";
import { useProfile } from "./useProfile";

interface UsePlanLimitsProps {
  userUid?: string; // Auth UID
  profile?: any; // Pre-fetched profile
  plano?: PlanoData | null; // Pre-fetched plano
  currentPassengerCount?: number; // For manual checks
}

export function usePlanLimits({ userUid, profile: profileProp, plano: planoProp, currentPassengerCount }: UsePlanLimitsProps = {}) {
  const { profile: fetchedProfile, plano: fetchedPlano } = useProfile(profileProp ? undefined : userUid);
  
  const profile = profileProp || fetchedProfile;
  const plano = planoProp || fetchedPlano;

  // --- Passenger Limits ---
  const passengerLimit = useMemo(() => {
    return profile?.assinaturas_usuarios?.[0]?.planos?.limite_passageiros ?? 
           plano?.planoCompleto?.limite_passageiros ?? 
           null;
  }, [profile, plano]);

  const remainingPassengers = useMemo(() => {
    if (passengerLimit === null) return null;
    return Math.max(0, Number(passengerLimit) - (currentPassengerCount || 0));
  }, [passengerLimit, currentPassengerCount]);

  const hasPassengerLimit = passengerLimit !== null;
  const isPassengerLimitReached = hasPassengerLimit && (remainingPassengers !== null && remainingPassengers <= 0);

  // --- Franchise (Billing) Limits ---
  // We need to fetch count if not provided, but usually this is used in specific contexts.
  // For now, we will include the logic from useValidarFranquia which fetches its own count 
  // ONLY if we need to check franchise.
  
  const usuarioId = profile?.id;
  
  // Always fetch automated billing count if we have a user ID, to provide this data readily
  const { data: billingCountData } = usePassageiroContagem(
    usuarioId,
    { enviar_cobranca_automatica: "true" },
    { enabled: !!usuarioId }
  );

  const franchiseLimit = profile?.assinaturas_usuarios?.[0]?.franquia_contratada_cobrancas || 0;
  const usedFranchise = (billingCountData as any)?.count || 0;
  const remainingFranchise = Math.max(0, franchiseLimit - usedFranchise);
  const canEnableAutomaticBilling = remainingFranchise > 0;

  return {
    plano,
    profile,
    limits: {
      passengers: {
        limit: passengerLimit ? Number(passengerLimit) : null,
        used: currentPassengerCount,
        remaining: remainingPassengers,
        hasLimit: hasPassengerLimit,
        isReached: isPassengerLimitReached,
      },
      franchise: {
        limit: franchiseLimit,
        used: usedFranchise,
        remaining: remainingFranchise,
        canEnable: canEnableAutomaticBilling,
      }
    }
  };
}
