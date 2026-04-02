import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { usuarioApi } from "../../services/api/usuario.api";
import { Usuario } from "../../types/usuario";
import { UserType } from "../../types/enums";
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

  const shouldFetchSummary = profile?.id && profile?.tipo === UserType.MOTORISTA;
  const { data: summary } = useUsuarioResumo(
    profile?.id, 
    undefined, 
    { staleTime: 5000, enabled: !!shouldFetchSummary }
  );

  return {
    profile,
    summary,
    isLoading: isLoading || (!!shouldFetchSummary && !summary && !!profile),
    isError, 
    error,
    isAuthenticated: !!profile,
    refreshProfile,
  };
}
