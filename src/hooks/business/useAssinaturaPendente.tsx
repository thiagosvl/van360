import {
  ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO,
  ASSINATURA_USUARIO_STATUS_TRIAL,
} from "@/constants";
import { useProfile } from "./useProfile";

export function useAssinaturaPendente(userId?: string) {
  const { profile, plano, isLoading } = useProfile(userId);

  // Verificar se a assinatura ativa está pendente de pagamento ou em trial
  const assinatura = profile?.assinaturas_usuarios?.[0];
  const isPendentePagamento =
    assinatura?.status === ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO &&
    assinatura?.ativo === true;
  const isTrial =
    assinatura?.status === ASSINATURA_USUARIO_STATUS_TRIAL &&
    assinatura?.ativo === true;
  const isPendente = isPendentePagamento || isTrial;
  const assinaturaId = isPendente ? assinatura.id : null;

  // Calcular informações do trial
  const agora = new Date();
  const trialEndAt = assinatura?.trial_end_at
    ? new Date(assinatura.trial_end_at)
    : null;
  const isValidTrial =
    isTrial && trialEndAt && trialEndAt >= agora;
  const isTrialExpirado =
    isTrial && trialEndAt && trialEndAt < agora;
  
  // Calcular dias restantes do trial
  let diasRestantes: number | null = null;
  if (isValidTrial && trialEndAt) {
    const diffTime = trialEndAt.getTime() - agora.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    diasRestantes = Math.max(0, diffDays);
  }

  return {
    isPendente: !!isPendente,
    assinaturaId,
    isTrial: !!isTrial,
    isValidTrial: !!isValidTrial,
    isTrialExpirado: !!isTrialExpirado,
    isPendentePagamento: !!isPendentePagamento,
    diasRestantes,
    plano,
    profile,
    isLoading,
  };
}

