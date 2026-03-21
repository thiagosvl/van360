import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api/client";

export interface SystemSummary {
  usuario: {
    ativo: boolean;
    flags: {
      pix_key_configurada: boolean;
      is_ativo: boolean;
      contrato_configurado: boolean;
      usar_contratos: boolean;
    };
  };
  contadores: {
    passageiros: {
      total: number;
      ativos: number;
      inativos: number;
      solicitacoes_pendentes: number;
    };
    veiculos: {
      total: number;
      ativos: number;
      inativos: number;
    };
    escolas: {
      total: number;
      ativos: number;
      inativos: number;
    };
  };
  financeiro?: {
    receita: {
      realizada: number;
      prevista: number;
      pendente: number;
      taxa_recebimento: number;
    };
    saidas: {
      total: number;
      margem_operacional: number;
    };
    atrasos: {
      valor: number;
      count: number;
    };
    ticket_medio: number;
  };
}

export const useUsuarioResumo = (
  usuarioId?: string,
  params?: { mes?: number; ano?: number },
  options?: { staleTime?: number; refetchOnMount?: boolean | "always" }
) => {
  const currentMes = new Date().getMonth() + 1;
  const currentAno = new Date().getFullYear();

  const mes = params?.mes ?? currentMes;
  const ano = params?.ano ?? currentAno;

  const queryKey = ["usuario-resumo", usuarioId, mes, ano];

  return useQuery<SystemSummary>({
    queryKey,
    queryFn: async () => {
      if (!usuarioId) throw new Error("ID de usuário necessário para o resumo");

      const response = await apiClient.get<SystemSummary>(`/usuarios/${usuarioId}/resumo`, {
        params: { mes, ano }
      });
      return response.data;
    },
    enabled: !!usuarioId,
    staleTime: options?.staleTime ?? 5000, // 5 seconds buffer to prevent duplicates on mount
    refetchOnMount: options?.refetchOnMount, 
  });
};
