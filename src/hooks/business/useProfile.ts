import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { usuarioApi } from "../../services/api/usuario.api";
import { Usuario } from "../../types/usuario";
import { extractPlanoData } from "../../utils/domain/plano/planoUtils";
import { useUsuarioResumo } from "../api/useUsuarioResumo";

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery<Usuario>({
    queryKey: ["profile"], 
    queryFn: () => usuarioApi.getProfile(userId!), 
    enabled: !!userId,
    staleTime: 1000 * 30,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const refreshProfile = useCallback(async () => {
    return queryClient.invalidateQueries({ queryKey: ["profile"] });
  }, [queryClient]);

  const { data: summary } = useUsuarioResumo(profile?.id);

  const planoData = useMemo(() => {
    if (!profile) return null;

    if (summary) {
        const p = summary.usuario.plano;
        const f = summary.usuario.flags;
        
        return {
            slug: p.slug,
            nome: p.nome,
            status: p.status,
            trial_end_at: p.trial_end_at,
            ...f
        };
    }

    const assinatura = profile.assinatura || profile.assinaturas_usuarios?.[0] || {};
    const planoRef = assinatura.planos || profile.plano;

    if (!planoRef) return null;

    const fallbackData = extractPlanoData({ 
        ...assinatura, 
        planos: planoRef 
    }, profile.flags);

    if (!fallbackData) return null;

    return fallbackData;
  }, [profile, summary]);

  const is_read_only = planoData?.is_read_only;

  return {
    profile,
    summary,
    plano: planoData,
    isLoading: isLoading || (!summary && !!profile),
    isAuthenticated: !!profile,
    refreshProfile,
    
    isEssencial: planoData?.is_essencial ?? false,
    isProfissional: planoData?.is_profissional ?? false,
    isReadOnly: is_read_only,
  };
}
