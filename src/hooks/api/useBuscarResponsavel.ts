import { apiClient } from "@/services/api/client";
import { useMutation } from "@tanstack/react-query";

export function useBuscarResponsavel() {
  return useMutation({
    mutationFn: async ({ cpf }: { cpf: string }) => {
      // Buscar passageiro com este CPF de responsável vinculado ao usuário atual
      const { data } = await apiClient.get("/passageiros/responsavel/lookup", {
        params: { cpf },
      });

      return data;
    },
  });
}
