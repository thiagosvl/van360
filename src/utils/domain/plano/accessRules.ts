import {
    FEATURE_COBRANCA_AUTOMATICA,
    FEATURE_GASTOS,
    FEATURE_NOTIFICACOES,
    FEATURE_PRE_PASSAGEIRO,
    FEATURE_RELATORIOS,
    PLANO_ESSENCIAL,
    PLANO_GRATUITO,
    PLANO_PROFISSIONAL,
    ROLE_ADMIN,
    ROLE_MOTORISTA
} from "@/constants";
import { extractPlanoData, getPlanoUsuario } from "./planoUtils";

/**
 * Tipo para dados do plano retornado por extractPlanoData
 */
export type PlanoData = ReturnType<typeof extractPlanoData> & { 
  role?: string 
};

/**
 * Valida se o usuário tem acesso a uma página específica
 * 
 * Agora baseada em PERFIL (Role-Based), não apenas em Plano.
 * Motoristas têm acesso a todas as páginas do app, as restrições são de Features.
 * Admins têm acesso apenas a páginas de admin.
 * 
 * @param href - Caminho da página
 * @param userRole - Role do usuário (opcional, pode vir no planoData ou separado)
 * @returns true se tem acesso
 */
export function hasPageAccess(
  href: string,
  planoData: PlanoData | null,
  userRole?: string
): boolean {
  // Se não tem role definida, assume motorista por compatibilidade ou bloqueia?
  // Por enquanto, vamos extrair do userRole se passado, ou tentar inferir.
  
  const currentRole = userRole || ROLE_MOTORISTA; // Default para motorista no app atual

  // Admin Access
  if (currentRole === ROLE_ADMIN) {
     return href.startsWith("/admin");
  }

  // Motorista Access
  if (currentRole === ROLE_MOTORISTA) {
    // Bloquear acesso a páginas de admin
    if (href.startsWith("/admin")) return false;
    
    // Liberar todas as rotas de motorista (Soft Gating)
    return true; 
  }

  return false;
}

/**
 * Mapeamento centralizado de Features por Plano.
 * Adicionar aqui novas features para facilitar manutenção.
 */
const PLAN_FEATURES: Record<string, string[]> = {
  [PLANO_GRATUITO]: [FEATURE_PRE_PASSAGEIRO],
  [PLANO_ESSENCIAL]: [FEATURE_PRE_PASSAGEIRO, FEATURE_GASTOS, FEATURE_RELATORIOS],
  [PLANO_PROFISSIONAL]: [
    FEATURE_PRE_PASSAGEIRO, 
    FEATURE_GASTOS, 
    FEATURE_RELATORIOS, 
    FEATURE_COBRANCA_AUTOMATICA, 
    FEATURE_NOTIFICACOES
  ]
};

/**
 * Função genérica para verificar acesso a features.
 * Substitui verificações manuais de plano.
 */
export function hasAccessToFeature(planoData: PlanoData | null, feature: string): boolean {
  if (!planoData || !planoData.isValidPlan) return false;
  
  const features = PLAN_FEATURES[planoData.slug] || [];
  return features.includes(feature) && planoData.isActive;
}

/**
 * Valida se o usuário tem acesso à funcionalidade de cadastro rápido (pre-passageiro)
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canUsePrePassageiro(planoData: PlanoData | null): boolean {
  return hasAccessToFeature(planoData, FEATURE_PRE_PASSAGEIRO);
}

/**
 * Valida se o usuário tem acesso à funcionalidade de cobrança automática
 * 
 * Regras:
 * - Plano Profissional ativo
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canUseCobrancaAutomatica(planoData: PlanoData | null): boolean {
  return hasAccessToFeature(planoData, FEATURE_COBRANCA_AUTOMATICA);
}

/**
 * Valida se o usuário tem acesso à funcionalidade de notificações automáticas
 * 
 * Regras:
 * - Plano Profissional ativo OU Plano Essencial ativo/trial válido
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canUseNotificacoes(planoData: PlanoData | null): boolean {
  return hasAccessToFeature(planoData, FEATURE_NOTIFICACOES);
}

/**
 * Valida se o usuário tem acesso à funcionalidade de relatórios
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canViewRelatorios(planoData: PlanoData | null): boolean {
  return hasAccessToFeature(planoData, FEATURE_RELATORIOS);
}

/**
 * Valida se o usuário tem acesso à funcionalidade de gastos
 * 
 * Regras:
 * - Plano Essencial válido OU Plano Profissional válido
 * 
 * @param planoData - Dados do plano do usuário
 * @returns true se tem acesso, false caso contrário
 */
export function canViewGastos(planoData: PlanoData | null): boolean {
  return hasAccessToFeature(planoData, FEATURE_GASTOS);
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
    // usuario aqui pode ser tanto o User do Supabase quanto o da tabela usuarios
    // Se for do Supabase, tem app_metadata. Se for da tabela, tinha role.
    // Vamos tentar pegar do app_metadata se existir
    const role = usuario?.app_metadata?.role;
    return hasPageAccess(href, planoData, role);
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

