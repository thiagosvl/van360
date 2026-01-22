import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { usuarioApi } from "../../services/api/usuario.api";
import { Usuario } from "../../types/usuario";
import { extractPlanoData } from "../../utils/domain/plano/planoUtils";

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery<Usuario>({
    queryKey: ["profile", userId],
    // userId param is mostly ignored for /me/profile but good for caching key differentiation if we ever fetch other profiles
    queryFn: () => usuarioApi.getProfile(userId!), 
    enabled: true, // Always try to fetch if mounted, usually session check handles existence
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const refreshProfile = useCallback(async () => {
    return queryClient.invalidateQueries({ queryKey: ["profile", userId] });
  }, [queryClient, userId]);

  // Plano Helpers
  const planoData = useMemo(() => {
    if (!profile?.plano) return null;
    // Combine subscription and plan for the utility
    // Precisamos garantir que assinatura exista, senão passamos objeto vazio ou null
    const assinaturaData = profile.assinatura || {};
    return extractPlanoData({ 
        ...assinaturaData, 
        planos: profile.plano 
    });
  }, [profile]);

  const isReadOnly = planoData ? !planoData.isValidPlan : false;

  return {
    profile,
    plano: planoData
      ? {
          ...planoData,
          isReadOnly
        }
      : null,
    isLoading,
    isAuthenticated: !!profile,
    refreshProfile,
    
    // Direct Access (Compatibility Wrappers)
    isEssencial: planoData?.isEssentialPlan ?? false,
    isProfissional: planoData?.isProfissionalPlan ?? false,
    isReadOnly: !!planoData && isReadOnly,
  };
}
