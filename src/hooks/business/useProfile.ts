import { PLANO_ESSENCIAL, PLANO_GRATUITO, PLANO_PROFISSIONAL } from "@/constants";
import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { Usuario } from "@/types/usuario";
import { getPlanoUsuario } from "@/utils/domain/plano/planoUtils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export async function fetchProfile(uid: string): Promise<Usuario | null> {
  console.log("[useProfile] Iniciando requisição /me/profile");
  const { data } = await apiClient.get<Usuario>("/me/profile");
  return data;
}


export function useProfile(uid?: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: uid ? ["profile", uid] : ["profile"],
    queryFn: () => {
      if (!uid) return null;
      return fetchProfile(uid);
    },
    enabled: !!uid,
    staleTime: 5000, // 5s de "deduping" (semelhante ao SWR), depois revalida. Otimiza navegação com validação frequente.
    refetchOnWindowFocus: true, // Revalida ao trocar de aba (essencial para segurança/logout)
    retry: false, 
  });

  useEffect(() => {
    if (error) {
       console.error("Erro no profile:", error);
       const axiosError = error as any;
       // Desloga se for erro de autenticação (401) ou Proibido/Inativo (403)
       if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
          sessionManager.signOut().catch(() => {});
       }
    }
  }, [error]);

  useEffect(() => {
    // Segurança extra: Se por acaso os dados vierem mas o flag estiver false (redundância)
    if (data && data.ativo === false) {
        sessionManager.signOut().catch(() => {});
    }
  }, [data]);

  const plano = useMemo(() => {
    if (!data) return null;
    return getPlanoUsuario(data);
  }, [data]);

  return {
    profile: data,
    plano,
    isGratuito: plano?.slug === PLANO_GRATUITO,
    isEssencial: plano?.slug === PLANO_ESSENCIAL,
    isProfissional: plano?.slug === PLANO_PROFISSIONAL,

    error,
    isLoading,
    refreshProfile: refetch, // Mantém compatibilidade com assinatura anterior
  };
}
