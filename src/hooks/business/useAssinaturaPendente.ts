import { useProfile } from "@/hooks/business/useProfile";

export function useAssinaturaPendente(userIdOrProfile?: string | any) {
  const isProfileInput =
    typeof userIdOrProfile === "object" && userIdOrProfile !== null;
  const userId =
    typeof userIdOrProfile === "string" ? userIdOrProfile : undefined;

  const {
    profile: fetchedProfile,
    plano: fetchedPlano,
    summary,
    isLoading: fetchedLoading,
  } = useProfile(userId);

  const profile = isProfileInput ? userIdOrProfile : fetchedProfile;
  const isLoading = isProfileInput ? false : fetchedLoading;

  // Se temos o plano do useProfile, ele já está consolidado com o resumo
  const {
    is_pendente: isPendente,
    is_trial_ativo,
    is_trial_valido: isValidTrial,
  } = (fetchedPlano as any) || {};

  const isTrialExpirado = is_trial_ativo && !isValidTrial;

  // Dias restantes vem direto do resumo se disponível
  const diasRestantes = summary?.usuario.flags.dias_restantes_trial ?? null;

  const isPendentePagamento = isPendente;

  const assinatura = profile?.assinaturas_usuarios?.length ? profile.assinaturas_usuarios[0] : null;

  return {
    isPendente: !!isPendente,
    assinaturaId: assinatura?.id,
    isTrial: !!is_trial_ativo,
    isValidTrial: !!isValidTrial,
    isTrialExpirado,
    isPendentePagamento: !!isPendentePagamento,
    diasRestantes,
    plano: fetchedPlano,
    profile,
    isLoading,
  };
}

