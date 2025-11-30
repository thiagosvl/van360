import {
  ASSINATURA_COBRANCA_STATUS_CANCELADA,
  ASSINATURA_USUARIO_STATUS_ATIVA,
  ASSINATURA_USUARIO_STATUS_TRIAL,
  PLANO_COMPLETO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";

/**
 * Extrai e normaliza os dados do plano a partir de uma assinatura
 */
export function extractPlanoData(assinatura: any) {
  if (!assinatura?.planos) return null;

  const plano = assinatura.planos;
  const slugBase = plano.parent?.slug ?? plano.slug;

  const agora = new Date();

  const isFreePlan = slugBase === PLANO_GRATUITO;
  const isCompletePlan = slugBase === PLANO_COMPLETO;
  const isEssentialPlan = slugBase === PLANO_ESSENCIAL;

  const isTrial = assinatura.status === ASSINATURA_USUARIO_STATUS_TRIAL;

  const isValidTrial =
    isTrial &&
    assinatura.trial_end_at &&
    new Date(assinatura.trial_end_at) >= agora;

  const isActive =
    assinatura.status === ASSINATURA_USUARIO_STATUS_ATIVA && assinatura.ativo;

  const isCanceled = assinatura.status === ASSINATURA_COBRANCA_STATUS_CANCELADA;

  const isValidCanceled =
    isCanceled &&
    assinatura.vigencia_fim &&
    new Date(assinatura.vigencia_fim) >= agora;

  const isValidPlan = isActive || isValidTrial || isValidCanceled;

  const nome = plano.parent?.nome ?? plano.nome;

  return {
    slug: slugBase,
    nome,
    status: assinatura.status,
    trial_end_at: assinatura.trial_end_at,
    ativo: assinatura.ativo,
    planoCompleto: plano,
    isTrial,
    isValidTrial,
    isActive,
    isValidPlan,
    isFreePlan,
    isCompletePlan,
    isEssentialPlan,
  };
}

/**
 * Obtém a assinatura mais recente de um usuário
 */
export function getLatestAssinatura(usuario: any) {
  if (!usuario?.assinaturas_usuarios?.length) return null;

  return [...usuario.assinaturas_usuarios].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}

/**
 * Obtém a assinatura ativa do perfil do usuário
 * @param profile - Perfil do usuário com assinaturas
 * @returns A assinatura ativa (onde ativo === true) ou null
 */
export function getAssinaturaAtiva(profile: any) {
  if (!profile?.assinaturas_usuarios) return null;
  return profile.assinaturas_usuarios.find((a: any) => a.ativo === true) || null;
}

/**
 * Calcula os dados do plano a partir de um usuário
 */
export function getPlanoUsuario(usuario: any) {
  const assinatura = getLatestAssinatura(usuario);
  if (!assinatura) return null;

  return extractPlanoData(assinatura);
}

/**
 * Valida se o usuário tem acesso à funcionalidade de solicitação de passageiros (pre-passageiro)
 * 
 * Regras:
 * - Pode usar: Qualquer plano ativo (Gratuito, Essencial trial/ativo, Completo ativo)
 * - Não pode usar: Apenas se a assinatura não estiver ativa (suspensa ou cancelada)
 * 
 * Nota: A funcionalidade está disponível para todos os planos ativos para maximizar o uso
 * e aumentar as chances de conversão de usuários do plano gratuito.
 */
export function hasPrePassageiroAccess(planoData: ReturnType<typeof extractPlanoData>): {
  hasAccess: boolean;
  reason?: string;
} {
  if (!planoData) {
    return {
      hasAccess: false,
      reason: "O motorista não possui uma assinatura ativa no momento.",
    };
  }

  // Verificar se o plano está ativo (isValidPlan considera ativo, trial válido ou cancelado válido)
  if (planoData.isValidPlan) {
    return { hasAccess: true };
  }

  // Se não está ativo, verificar o motivo específico
  if (planoData.isTrial && !planoData.isValidTrial) {
    return {
      hasAccess: false,
      reason: "O período de testes do motorista expirou.",
    };
  }

  // Assinatura suspensa ou cancelada
  return {
    hasAccess: false,
    reason: "A assinatura do motorista está suspensa ou cancelada. É necessário regularizar para reativar o acesso.",
  };
}

/**
 * Valida se o usuário tem acesso aos relatórios
 * 
 * Regras:
 * - Plano Completo (qualquer status válido) OU
 * - Plano Essencial ativo OU
 * - Trial válido
 */
export function hasRelatoriosAccess(planoData: ReturnType<typeof extractPlanoData>): boolean {
  if (!planoData) return false;

  return (
    planoData.isCompletePlan ||
    (planoData.isEssentialPlan && planoData.isActive) ||
    (planoData.isTrial && planoData.isValidTrial)
  );
}
