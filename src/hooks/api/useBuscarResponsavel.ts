import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";

export function useBuscarResponsavel() {
  return useMutation({
    mutationFn: async ({ cpf, usuarioId }: { cpf: string; usuarioId: string }) => {
      // Buscar passageiro com este CPF de responsável vinculado ao usuário atual
      const { data, error } = await supabase
        .from("passageiros")
        .select("nome_responsavel, email_responsavel, telefone_responsavel")
        .eq("usuario_id", usuarioId)
        .eq("cpf_responsavel", cpf)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 é "no rows returned"
        throw error;
      }

      return data;
    },
  });
}
