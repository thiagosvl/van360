import { passageiroApi } from "@/services/api/passageiro.api";
import { useQuery } from "@tanstack/react-query";
import { AniversariantesResponse } from "@/types/passageiro";

export function useAniversariantes(mes: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["aniversariantes", mes],
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60, // 1 hora
    refetchOnMount: true, // Força buscar ao entrar na tela se o cache foi invalidado (ignora a config global que bloqueia)
    queryFn: async (): Promise<AniversariantesResponse> => {
      const response = await passageiroApi.getAniversariantes(mes);
      return response;
    },
  });
}
