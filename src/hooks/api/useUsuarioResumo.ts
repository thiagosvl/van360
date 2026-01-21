import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api/client";

export interface SystemSummary {
  usuario: {
    ativo: boolean;
    plano: {
      slug: string;
      nome: string;
      status: string;
      limites: {
        passageiros_max: number | null;
        passageiros_restantes: number | null;
        franquia_cobranca_max: number;
        franquia_cobranca_restante: number;
      };
      funcionalidades: {
        cobranca_automatica: boolean;
        notificacoes_whatsapp: boolean;
        relatorios_financeiros: boolean;
        gestao_gastos: boolean;
      };
    };
    flags: {
      is_trial_ativo: boolean;
      dias_restantes_trial: number;
      trial_dias_total: number;
      whatsapp_status: "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "UNKNOWN" | "NOT_FOUND" | null;
      ultima_fatura: "pago" | "pendente_pagamento" | "cancelada" | null;
      limite_franquia_atingido: boolean;
      pix_key_configurada: boolean;
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
      com_automacao: number;
    };
    escolas: {
      total: number;
      ativos: number;
      inativos: number;
      com_automacao: number;
    };
  };
}

export const useUsuarioResumo = () => {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  return useQuery<SystemSummary>({
    queryKey: ["usuario-resumo", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Perfil de usuário não carregado");

      // Agora usamos o profile.id (ID Público) compatível com o backend
      const response = await apiClient.get<SystemSummary>(`/usuarios/${profile.id}/resumo`);
      return response.data;
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
