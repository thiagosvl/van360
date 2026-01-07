import { PLANO_ESSENCIAL, PLANO_GRATUITO, PLANO_PROFISSIONAL } from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/usuario";
import { getPlanoUsuario } from "@/utils/domain/plano/planoUtils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export async function fetchProfile(uid: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      `
    *,
    assinaturas_usuarios (
      *,
      planos (*, parent:parent_id (*))
    )
  `
    )
    .eq("auth_uid", uid)
    .eq("assinaturas_usuarios.ativo", true) // pega só a assinatura vigente
    .maybeSingle();

  if (error) throw error;
  return data as Usuario | null;
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
       // Se der erro ao buscar perfil (ex: usuário deletado, 401, etc), desloga
       supabase.auth.signOut().catch(() => {});
    }
  }, [error]);

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
