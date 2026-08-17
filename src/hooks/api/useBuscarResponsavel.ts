import { apiClient } from "@/services/api/client";
import { useMutation } from "@tanstack/react-query";

export function useBuscarResponsavel() {
  return useMutation({
    mutationFn: async (params: { cpf?: string; telefone?: string; term?: string }) => {
      const { data } = await apiClient.get("/passageiros/responsavel/lookup", {
        params,
      });

      return data;
    },
  });
}
