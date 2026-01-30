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
    summary,
    isLoading, 
    refreshProfile,
    is_essencial,
    is_profissional,
    is_read_only,
    isError,
    error
  } = useProfile(user?.id);

  // Role extraction: Prioritize database (source of truth) -> fallback to auth metadata
  const role = profile?.tipo || (user?.app_metadata?.role as string | undefined);

  // Regras de Funcionalidades (Features) vindas do resumo consolidado
  const canUseAutomatedCharges = summary?.usuario.plano.funcionalidades.cobranca_automatica ?? false;
  const canUseNotifications = summary?.usuario.plano.funcionalidades.notificacoes_whatsapp ?? false;
  
  return {
    isLoading,
    
    canUseAutomatedCharges,
    canUseNotifications,

    is_essencial,
    is_profissional,
    is_read_only,
    
    plano,
    role,
    profile,
    summary,
    refreshProfile,
    isError,
    error
  };
}
