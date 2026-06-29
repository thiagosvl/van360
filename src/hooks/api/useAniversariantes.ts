import { passageiroApi } from "@/services/api/passageiro.api";
import { useQuery } from "@tanstack/react-query";

export interface Aniversariante {
  id: string;
  nome: string;
  dia: number;
  veiculo?: { id: string; placa: string; modelo?: string };
  escola?: { id: string; nome: string };
}

export interface SemanaAniversario {
  semana: number;
  aniversariantes: Aniversariante[];
}

export interface AniversariantesResponse {
  semanas: SemanaAniversario[];
  passageirosSemData: number;
  passageirosSemDataList?: Omit<Aniversariante, "dia">[];
}

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
