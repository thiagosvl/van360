import { getPlanoUsuario, hasPrePassageiroAccess } from "@/utils/domain/plano/planoUtils";

/**
 * Valida se o motorista tem acesso à funcionalidade de solicitação de passageiros
 * baseado no plano e status da assinatura.
 * 
 * Regras:
 * - Pode usar: Qualquer plano ativo (Essencial trial/ativo, Profissional ativo)
 * - Não pode usar: Apenas se a assinatura não estiver ativa (suspensa ou cancelada)
 * 
 * @param usuario - Objeto com dados do usuário incluindo assinaturas_usuarios e planos
 * @returns Objeto com hasAccess (boolean) e reason (string opcional explicando o motivo)
 */
export function validatePrePassageiroAccess(usuario: any): {
  hasAccess: boolean;
  reason?: string;
} {
  const planoData = getPlanoUsuario(usuario);
  return hasPrePassageiroAccess(planoData);
}

