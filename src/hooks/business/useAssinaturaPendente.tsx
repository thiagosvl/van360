import { useProfile } from "@/hooks/business/useProfile";
import {
  calculateTrialInfo,
  getPlanoUsuario,
  isSubscriptionPending,
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

  // Memoize plan derivation if manually provided, otherwise use fetched
  const plano = useMemo(() => {
    if (isProfileInput) return getPlanoUsuario(profile);
    return fetchedPlano;
  }, [isProfileInput, profile, fetchedPlano]);

  // Verificar se a assinatura ativa está pendente de pagamento ou em trial
  const assinatura = profile?.assinaturas_usuarios
    ? [...profile.assinaturas_usuarios].shift() // Get first (most recent if ordered by backend/query) or logic
    : undefined;

  // Usa helpers centralizados para validar regras de negócio
  const isPendente = isSubscriptionPending(assinatura);
  const assinaturaId = isPendente && assinatura ? assinatura.id : null;

  // Calcular informações do trial
  const {
    isTrial,
    isValidTrial,
    isTrialExpirado,
    diasRestantes,
  } = calculateTrialInfo(assinatura);

  const isPendentePagamento =
    isPendente && !isTrial && assinatura?.status === "pendente_pagamento";

  return {
    isPendente,
    assinaturaId,
    isTrial,
    isValidTrial,
    isTrialExpirado,
    isPendentePagamento,
    diasRestantes,
    plano,
    profile,
    isLoading,
  };
}

