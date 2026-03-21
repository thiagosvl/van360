import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { usuarioApi } from "../../services/api/usuario.api";
import { Usuario } from "../../types/usuario";
import { useUsuarioResumo } from "../api/useUsuarioResumo";

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    error
  } = useQuery<Usuario>({
    queryKey: ["profile"], 
    queryFn: () => usuarioApi.getProfile(userId!), 
    enabled: !!userId,
    staleTime: 5000, 
    retry: false,
    refetchOnWindowFocus: true,     
    refetchOnMount: true,
  });

  const refreshProfile = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] })
    ]);
  }, [queryClient]);

  const { data: summary } = useUsuarioResumo(profile?.id, undefined, { staleTime: 5000 });

  return {
    profile,
    summary,
    isLoading: isLoading || (!summary && !!profile),
    isError, 
    error,
    isAuthenticated: !!profile,
    refreshProfile,
  };
}
