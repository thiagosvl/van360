import {
  ASSINATURA_COBRANCA_STATUS_CANCELADA,
  ASSINATURA_USUARIO_STATUS_ATIVA,
  ASSINATURA_USUARIO_STATUS_TRIAL,
  PLANO_COMPLETO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/usuario";
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

function getPlanoUsuario(usuario: any) {
  if (!usuario?.assinaturas_usuarios?.length) return null;

  const assinatura = [...usuario.assinaturas_usuarios].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  if (!assinatura?.planos) return null;

  const plano = assinatura.planos;
  const slugBase = plano.parent?.slug ?? plano.slug;

  const agora = new Date();

  const isFreePlan = slugBase === PLANO_GRATUITO;
  const isCompletePlan = slugBase === PLANO_COMPLETO;
  const isEssentialPlan = slugBase === PLANO_ESSENCIAL;

  const isTrial = assinatura.status === ASSINATURA_USUARIO_STATUS_TRIAL;

  const isValidTrial =
    isTrial &&
    assinatura.trial_end_at &&
    new Date(assinatura.trial_end_at) >= agora;

  const isActive =
    assinatura.status === ASSINATURA_USUARIO_STATUS_ATIVA && assinatura.ativo;

  const isCanceled = assinatura.status === ASSINATURA_COBRANCA_STATUS_CANCELADA;

  const isValidCanceled =
    isCanceled &&
    assinatura.vigencia_fim &&
    new Date(assinatura.vigencia_fim) >= agora;

  const isValidPlan = isActive || isValidTrial || isValidCanceled;

  return {
    slug: slugBase,
    status: assinatura.status,
    trial_end_at: assinatura.trial_end_at,
    ativo: assinatura.ativo,
    planoCompleto: plano,
    isTrial,
    isValidTrial: isValidTrial,
    isActive,
    isValidPlan,
    isFreePlan,
    isCompletePlan,
    isEssentialPlan,
  };
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
