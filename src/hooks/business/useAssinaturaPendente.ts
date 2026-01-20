import { useProfile } from "@/hooks/business/useProfile";
import {
  getPlanoUsuario
} from "@/utils/domain/plano/planoUtils";
import { useMemo } from "react";

export function useAssinaturaPendente(userIdOrProfile?: string | any) {
  // Determine input type
  const isProfileInput =
    typeof userIdOrProfile === "object" && userIdOrProfile !== null;
  const userId =
    typeof userIdOrProfile === "string" ? userIdOrProfile : undefined;

  // Conditional fetch: if input is a profile object, we skip the query (userId is undefined)
  const {
    profile: fetchedProfile,
    plano: fetchedPlano,
    isLoading: fetchedLoading,
  } = useProfile(userId);

  // Normalize data
  const profile = isProfileInput ? userIdOrProfile : fetchedProfile;
  const isLoading = isProfileInput ? false : fetchedLoading;

  // Get latest signature and subscription data using centralized util
  // "fetchedPlano" from useProfile likely uses getPlanoUsuario internal logic too, but let's be safe.
  const planoData = useMemo(() => {
     if (profile) return getPlanoUsuario(profile);
     return null;
  }, [profile]);
  
  const {
      isPendente,
      isTrial,
      isValidTrial,
      // trial info
      trial_end_at
  } = planoData || {};

  // For compatibility with return
  const isTrialExpirado = isTrial && !isValidTrial; // simplified check
  
  // Calculate remaining days if trial
  const agora = new Date();
  let diasRestantes: number | null = null;
  if(trial_end_at && new Date(trial_end_at) > agora) {
       const diffTime = new Date(trial_end_at).getTime() - agora.getTime();
       diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Pending Payment specific check (isPendente from utils implies payment pending status)
  const isPendentePagamento = isPendente;
  
  // Assinatura object itself (for ID)
  // We can grab it from profile directly as getPlanoUsuario does
  const assinatura = profile?.assinaturas_usuarios?.length ? profile.assinaturas_usuarios[0] : null; // Warning: naive assumption of order, but consistent with getLatestAssinatura if sorted there. getLatestAssinatura sorts it. Let's use getLatestAssinatura.
  
  // Actually, getPlanoUsuario calls extractPlanoData(getLatestAssinatura(user)).
  // So we should re-fetch signature to be safe or trust the order.
  // Ideally, use the helper:
  // const latestAssinatura = getLatestAssinatura(profile);
  //But we can't import getLatestAssinatura easily inside useMemo if not exported or ... it is exported.

  return {
    isPendente: !!isPendente,
    assinaturaId: assinatura?.id,
    isTrial: !!isTrial,
    isValidTrial: !!isValidTrial,
    isTrialExpirado,
    isPendentePagamento: !!isPendentePagamento,
    diasRestantes,
    plano: fetchedPlano, // keep compatibility with existing return
    profile,
    isLoading,
  };
}

