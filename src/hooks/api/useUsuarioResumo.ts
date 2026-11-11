import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api/client";
import { getNowBR } from "@/utils/dateUtils";

export interface SystemSummary {
  usuario: {
    ativo: boolean;
    flags: {
      pix_key_configurada: boolean;
      is_ativo: boolean;
      usar_contratos: boolean;
    };
  };
  contadores: {
    passageiros: {
      total: number;
      ativos: number;
      inativos: number;
      solicitacoes_pendentes: number;
      sem_valor_cobranca?: number;
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
      despesas_escolares?: number;
      margem_operacional: number;
    };
    atrasos: {
      valor: number;
      count: number;
    };
    ticket_medio: number;
    custo_por_passageiro?: number;
    viagens?: {
      fretamentos_realizado: number;
      fretamentos_previsto: number;
      fretamentos_pendente: number;
      passeios_realizado: number;
      passeios_previsto: number;
      passeios_pendente: number;
      total_realizado: number;
      total_previsto: number;
      total_pendente: number;
    };
  };
}

export const useUsuarioResumo = (
  usuarioId?: string,
  params?: { mes?: number; ano?: number; veiculoId?: string },
  options?: { staleTime?: number; refetchOnMount?: boolean | "always"; enabled?: boolean }
) => {
  const currentMes = getNowBR().getMonth() + 1;
  const currentAno = getNowBR().getFullYear();
 
  const mes = params?.mes ?? currentMes;
  const ano = params?.ano ?? currentAno;
  const veiculoId = params?.veiculoId;
 
  const queryKey = ["usuario-resumo", usuarioId, mes, ano, veiculoId];
 
  return useQuery<SystemSummary>({
    queryKey,
    queryFn: async () => {
      if (!usuarioId) throw new Error("ID de usuário necessário para o resumo");
 
      const response = await apiClient.get<SystemSummary>(`/usuarios/${usuarioId}/resumo`, {
        params: { mes, ano, veiculo_id: veiculoId }
      });
      return response.data;
    },
    enabled: !!usuarioId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 60000, // 1 minuto de cache padrão
    refetchOnMount: options?.refetchOnMount, 
    refetchOnWindowFocus: false,
  });
};
