import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { usuarioApi } from "../../services/api/usuario.api";
import { Usuario } from "../../types/usuario";
import { useUsuarioResumo } from "../api/useUsuarioResumo";
import {
  isMotoristaTitular,
  isMotoristaAuxiliar as checkIsMotoristaAuxiliar,
  isMonitor as checkIsMonitor,
  isSubConta as checkIsSubConta,
  getDonoContaId,
} from "@/utils/userUtils";

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

  const isGestor = isMotoristaTitular(profile);
  const isMotoristaAuxiliar = checkIsMotoristaAuxiliar(profile);
  const isMonitor = checkIsMonitor(profile);
  const isSubConta = checkIsSubConta(profile);
  const donoContaId = getDonoContaId(profile);

  const shouldFetchSummary = profile?.id && (isGestor || isSubConta);
  
  const summaryParams = useMemo(
    () => (profile?.veiculo_id ? { veiculoId: profile.veiculo_id } : undefined),
    [profile?.veiculo_id]
  );

  const { data: summary } = useUsuarioResumo(
    profile?.id, 
    summaryParams, 
    { staleTime: 5000, enabled: !!shouldFetchSummary }
  );

  return {
    profile,
    summary,
    isLoading: isLoading || (!!shouldFetchSummary && !summary && !!profile),
    isError, 
    error,
    isAuthenticated: !!profile,
    isGestor,
    isMotoristaAuxiliar,
    isMonitor,
    isSubConta,
    donoContaId,
    refreshProfile,
  };
}
