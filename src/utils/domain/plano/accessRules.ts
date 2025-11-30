import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { extractPlanoData, getPlanoUsuario, hasPrePassageiroAccess, hasRelatoriosAccess } from "./planoUtils";

/**
 * Tipo para dados do plano retornado por extractPlanoData
 */
export type PlanoData = ReturnType<typeof extractPlanoData>;

/**
 * Valida se o usuário tem acesso a uma página específica
 * 
 * @param href - Caminho da página (ex: "/gastos", "/relatorios")
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function hasPageAccess(
  href: string,
  planoData: PlanoData | null
): boolean {
  if (!planoData) return false;

  // Mapeamento de páginas e planos que têm acesso
  const pageAccessMap: Record<string, string[]> = {
    "/inicio": [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/cobrancas": [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/passageiros": [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/escolas": [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/veiculos": [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/gastos": [PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/relatorios": [PLANO_ESSENCIAL, PLANO_COMPLETO],
    "/assinatura": [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
  };

  const allowedPlans = pageAccessMap[href];
  if (!allowedPlans) return false;

  // Verificar se o plano está na lista de permitidos E se o plano é válido
  const hasAllowedPlan = allowedPlans.includes(planoData.slug);
  return hasAllowedPlan && planoData.isValidPlan;
}

/**
 * Valida se o usuário tem acesso à funcionalidade de cadastro rápido (pre-passageiro)
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canUsePrePassageiro(planoData: PlanoData | null): boolean {
  if (!planoData) return false;
  const access = hasPrePassageiroAccess(planoData);
  return access.hasAccess;
}

/**
 * Valida se o usuário tem acesso à funcionalidade de cobrança automática
 * 
 * Regras:
 * - Plano Completo ativo
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canUseCobrancaAutomatica(planoData: PlanoData | null): boolean {
  if (!planoData) return false;
  return planoData.isCompletePlan && planoData.isActive;
}

/**
 * Valida se o usuário tem acesso à funcionalidade de notificações automáticas
 * 
 * Regras:
 * - Plano Completo ativo OU Plano Essencial ativo/trial válido
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canUseNotificacoes(planoData: PlanoData | null): boolean {
  if (!planoData) return false;
  return (
    (planoData.isCompletePlan && planoData.isActive)
  );
}

/**
 * Valida se o usuário tem acesso à funcionalidade de relatórios
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canViewRelatorios(planoData: PlanoData | null): boolean {
  return hasRelatoriosAccess(planoData);
}

/**
 * Valida se o usuário tem acesso à funcionalidade de gastos
 * 
 * Regras:
 * - Plano Essencial válido OU Plano Completo válido
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canViewGastos(planoData: PlanoData | null): boolean {
  if (!planoData) return false;
  return (
    (planoData.isEssentialPlan && planoData.isValidPlan) ||
    (planoData.isCompletePlan && planoData.isValidPlan)
  );
}

/**
 * Valida se o usuário tem limite de passageiros (apenas plano gratuito)
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem limite, false caso contrário
 */
export function hasPassageirosLimit(planoData: PlanoData | null): boolean {
  if (!planoData) return false;
  return planoData.isFreePlan;
}

/**
 * Valida se o usuário pode usar funcionalidades premium
 * (qualquer plano que não seja gratuito e esteja válido)
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se pode usar, false caso contrário
 */
export function canUsePremiumFeatures(planoData: PlanoData | null): boolean {
  if (!planoData) return false;
  return !planoData.isFreePlan && planoData.isValidPlan;
}

/**
 * Wrapper para validar acesso a partir de um usuário completo
 * Útil quando você tem o objeto usuario mas não o planoData extraído
 */
export const accessRules = {
  /**
   * Valida acesso a página a partir de um usuário
   */
  hasPageAccessFromUser: (href: string, usuario: any): boolean => {
    const planoData = getPlanoUsuario(usuario);
    return hasPageAccess(href, planoData);
  },

  /**
   * Valida acesso a pre-passageiro a partir de um usuário
   */
  canUsePrePassageiroFromUser: (usuario: any): boolean => {
    const planoData = getPlanoUsuario(usuario);
    return canUsePrePassageiro(planoData);
  },

  /**
   * Valida acesso a cobrança automática a partir de um usuário
   */
  canUseCobrancaAutomaticaFromUser: (usuario: any): boolean => {
    const planoData = getPlanoUsuario(usuario);
    return canUseCobrancaAutomatica(planoData);
  },

  /**
   * Valida acesso a notificações a partir de um usuário
   */
  canUseNotificacoesFromUser: (usuario: any): boolean => {
    const planoData = getPlanoUsuario(usuario);
    return canUseNotificacoes(planoData);
  },
};

