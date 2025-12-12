import { useProfile } from "@/hooks/business/useProfile";
import { canUseCobrancaAutomatica, canUseNotificacoes, canUsePrePassageiro, canViewGastos, canViewRelatorios } from "@/utils/domain/plano/accessRules";
import { useSession } from "./useSession";

/**
 * Hook centralizado para verificação de permissões e regras de acesso do usuário.
 * Abstrai a necessidade de acessar plano.slug diretamente nos componentes.
 */
export function usePermissions() {
  const { user } = useSession();
  // Role extraction from Auth (Strict source of truth per architecture V3)
  const role = user?.app_metadata?.role as string | undefined;

  const { profile, plano, isLoading } = useProfile(user?.id);

  // Regras de Visualização (Páginas/Módulos)
  const canViewModuleGastos = canViewGastos(plano);
  const canViewModuleRelatorios = canViewRelatorios(plano);

  // Regras de Funcionalidades (Features)
  const canUseAutomatedCharges = canUseCobrancaAutomatica(plano);
  const canUseNotifications = canUseNotificacoes(plano);
  const canUseQuickStart = canUsePrePassageiro(plano);

  // Regras de Edição e Ações
  // Exemplo: Pode editar cobrança se tiver plano válido (geral)
  // Pode ser refinado para regras mais complexas
  const canEditCobranca = !!plano?.isValidPlan; 
  const canCreateCobranca = !!plano?.isValidPlan;

  // Helpers de Limites
  // Se futuramente precisarmos de limites (ex: max de passageiros), exportamos aqui também
  const isFreePlan = plano?.isFreePlan ?? false;

  return {
    isLoading,
    
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
    isFreePlan,
    
    // Raw Data (Use com cautela, prefira as flags acima)
    plano,
    role,
    profile
  };
}
