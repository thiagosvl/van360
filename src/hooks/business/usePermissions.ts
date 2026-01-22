import { useUsuarioResumo } from "../api/useUsuarioResumo";
import { useProfile } from "./useProfile";
import { useSession } from "./useSession";

/**
 * Hook centralizado para verificação de permissões e regras de acesso do usuário.
 * Abstrai a necessidade de acessar plano.slug diretamente nos componentes.
 */
export function usePermissions() {
  const { user } = useSession();
  
  const { 
    profile, 
    plano, 
    isLoading, 
    refreshProfile,
    isEssencial,
    isProfissional,
} = useProfile(user?.id);

  // Role extraction: Prioritize database (source of truth) -> fallback to auth metadata
  const role = profile?.tipo || (user?.app_metadata?.role as string | undefined);

  // NEW: Use backend source of truth for features
  const { data: summary, isLoading: isSummaryLoading } = useUsuarioResumo();



  // Regras de Visualização (Páginas/Módulos)
  // Agora usamos a flag 'gestao_gastos' que vem do backend
  const canViewModuleGastos = summary?.usuario.plano.funcionalidades.gestao_gastos ?? false;
  const canViewModuleRelatorios = summary?.usuario.plano.funcionalidades.relatorios_financeiros ?? false;

  // Regras de Funcionalidades (Features)
  const canUseAutomatedCharges = summary?.usuario.plano.funcionalidades.cobranca_automatica ?? false;
  const canUseNotifications = summary?.usuario.plano.funcionalidades.notificacoes_whatsapp ?? false;
  
  // QuickStart/PrePassageiro ainda é liberado para todos, mas podemos adicionar flag no backend depois se quiser
  // Por enquanto mantemos via regra local ou assumimos true se não bloqueado
  const canUseQuickStart = true; // Feature básica liberada geral

  // Regras de Edição e Ações
  const canEditCobranca = !!plano?.isValidPlan; 
  const canCreateCobranca = !!plano?.isValidPlan;

  return {
    isLoading: isLoading || isSummaryLoading,
    
    // Modules
    canViewModuleGastos,
    canViewModuleRelatorios,

    // Features
    canUseAutomatedCharges,
    canUseNotifications,
    canUseQuickStart,

    // Actions
    canEditCobranca,
    canCreateCobranca,

    // State

    isEssencial,
    isProfissional,
    isReadOnly: plano?.isReadOnly ?? false,
    
    // Raw Data (Use com cautela, prefira as flags acima)
    plano,
    role,
    profile,
    refreshProfile
  };
}
