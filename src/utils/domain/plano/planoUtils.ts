import {
  PLANO_ESSENCIAL,
  PLANO_PROFISSIONAL
} from "@/constants";

/**
 * Extrai e normaliza os dados do plano a partir de uma assinatura.
 * O frontend agora é um passthrough das flags calculadas no backend.
 */
export function extractPlanoData(assinatura: any, backendFlags?: any) {
  if (!assinatura?.planos && !backendFlags) return null;

  const plano = assinatura?.planos || {};
  const slugBase = plano.parent?.slug ?? plano.slug;
  const nome = plano.parent?.nome ?? plano.nome;

  // Priorizar as flags que vieram do backend (seja via parâmetro ou no próprio objeto)
  const f = backendFlags || assinatura?.flags || {};

  return {
    slug: slugBase,
    nome,
    status: assinatura?.status,
    trial_end_at: assinatura?.trial_end_at,
    ativo: assinatura?.ativo,
    planoProfissional: plano,

    // Backend Aligned Flags (Passthrough)
    is_trial_ativo: f.is_trial_ativo ?? false,
    is_trial_valido: f.is_trial_valido ?? false,
    is_plano_valido: f.is_plano_valido ?? false,
    is_read_only: f.is_read_only ?? false,
    is_ativo: f.is_ativo ?? false,
    is_pendente: f.is_pendente ?? false,
    is_suspensa: f.is_suspensa ?? false,
    is_cancelada: f.is_cancelada ?? false,
    is_profissional: f.is_profissional ?? (slugBase === PLANO_PROFISSIONAL),
    is_essencial: f.is_essencial ?? (slugBase === PLANO_ESSENCIAL),
  };
}

/**
 * Obtém a assinatura mais recente de um usuário
 */
export function getLatestAssinatura(usuario: any) {
  if (usuario?.assinatura) return usuario.assinatura;

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