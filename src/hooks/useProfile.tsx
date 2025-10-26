import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/usuario";
import useSWR from "swr";

async function fetchProfile(uid: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_uid", uid)
    .maybeSingle();

  if (error) throw error;
  return data as Usuario | null;
}

export function useProfile(uid?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    uid ? ["profile", uid] : null,
    () => fetchProfile(uid),
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  return {
    profile: data,
    error,
    isLoading,
    refreshProfile: mutate,
  };
}
