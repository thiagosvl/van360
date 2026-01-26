import { AssinaturaCobrancaStatus } from "@/types/enums";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api/client";

export interface SystemSummary {
  usuario: {
    ativo: boolean;
    plano: {
      slug: string;
      nome: string;
      status: string;
      trial_end_at?: string;
      limites: {
        franquia_cobranca_max: number;
        franquia_cobranca_restante: number;
      };
      funcionalidades: {
        cobranca_automatica: boolean;
        notificacoes_whatsapp: boolean;
      };
    };
    flags: {
      is_trial_ativo: boolean;
      is_trial_valido: boolean;
      dias_restantes_trial: number | null;
      dias_restantes_assinatura: number | null;
      trial_dias_total: number;

      ultima_fatura: AssinaturaCobrancaStatus | null;
      ultima_fatura_id: string | null;
      limite_franquia_atingido: boolean;
      pix_key_configurada: boolean;
      is_plano_valido: boolean;
      is_read_only: boolean;
      is_ativo: boolean;
      is_pendente: boolean;
      is_suspensa: boolean;
      is_cancelada: boolean;
      is_profissional: boolean;
      is_essencial: boolean;
    };
  };
  contadores: {
    passageiros: {
      total: number;
      ativos: number;
      inativos: number;
      com_automacao: number;
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
