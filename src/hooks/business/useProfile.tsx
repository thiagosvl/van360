import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/usuario";
import { getPlanoUsuario } from "@/utils/domain/plano/planoUtils";
import { useMemo } from "react";
import useSWR from "swr";

async function fetchProfile(uid: string): Promise<Usuario | null> {
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
  const { data, error, isLoading, mutate } = useSWR(
    uid ? ["profile", uid] : null,
    () => {
      if (!uid) return null;
      return fetchProfile(uid);
    },
    {
      revalidateOnFocus: false, // Desabilitar revalidação automática ao focar para evitar requisições duplicadas
      shouldRetryOnError: false,
      dedupingInterval: 2000, // Deduplicar requisições dentro de 2 segundos
    }
  );

  const plano = useMemo(() => {
    if (!data) return null;
    return getPlanoUsuario(data);
  }, [data]);

  return {
    profile: data,
    plano,
    error,
    isLoading,
    refreshProfile: mutate,
  };
}
