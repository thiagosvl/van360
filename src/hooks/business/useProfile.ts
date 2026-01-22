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
    queryKey: ["profile"], 
    // userId is ignored for /me/profile requests as it relies on auth token
    queryFn: () => usuarioApi.getProfile(userId!), 
    enabled: !!userId, // Only fetch if we have a userId (session loaded), avoids fetching for guest/initial invalid state
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const refreshProfile = useCallback(async () => {
    return queryClient.invalidateQueries({ queryKey: ["profile"] });
  }, [queryClient]);

  // Plano Helpers
  const planoData = useMemo(() => {
    if (!profile) return null;

    // Fallbacks para encontrar a assinatura e o plano
    const assinatura = profile.assinatura || profile.assinaturas_usuarios?.[0] || {};
    const planoRef = assinatura.planos || profile.plano;

    if (!planoRef) return null;

    return extractPlanoData({ 
        ...assinatura, 
        planos: planoRef 
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
