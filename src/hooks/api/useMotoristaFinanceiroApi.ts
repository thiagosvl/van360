import { apiClient } from "@/services/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

import { ModalidadeCobrancaEnum, ContractMultaTipo } from "@/types/enums";

export type MotoristaConfiguracaoFinanceira = Tables<"motorista_configuracoes_financeiras"> & {
  taxa_efetiva: number;
};

export type UpdateMotoristaFinanceiroPayload = {
  cobranca_automatica_ativa?: boolean;
  enviar_recibo_automatico?: boolean;
  chave_pix_repasse?: string | null;
  tipo_chave_pix?: string | null;
  repassar_taxa_pais_padrao?: boolean;
  taxa_personalizada?: number | null;
  modalidade_cobranca?: ModalidadeCobrancaEnum;
  cobrar_multa_atraso?: boolean;
  multa_atraso_tipo?: ContractMultaTipo | null;
  multa_atraso_valor?: number | null;
  cobrar_juros_atraso?: boolean;
  juros_atraso_tipo?: ContractMultaTipo | null;
  juros_atraso_valor?: number | null;
  dias_carencia_atraso?: number;
  dias_validade_apos_vencimento?: number;
};

const MOTORISTA_FINANCEIRO_QUERY_KEY = ["motorista-financeiro"];

export function useMotoristaFinanceiroApi() {
  const queryClient = useQueryClient();

  const query = useQuery<MotoristaConfiguracaoFinanceira>({
    queryKey: MOTORISTA_FINANCEIRO_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<MotoristaConfiguracaoFinanceira>("/motorista/configuracoes-financeiras");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async (payload: UpdateMotoristaFinanceiroPayload) => {
      const { data } = await apiClient.put<MotoristaConfiguracaoFinanceira>(
        "/motorista/configuracoes-financeiras",
        payload
      );
      return data;
    },
    onMutate: async (newConfig) => {
      await queryClient.cancelQueries({ queryKey: MOTORISTA_FINANCEIRO_QUERY_KEY });
      const previousConfig = queryClient.getQueryData<MotoristaConfiguracaoFinanceira>(MOTORISTA_FINANCEIRO_QUERY_KEY);

      if (previousConfig) {
        queryClient.setQueryData<MotoristaConfiguracaoFinanceira>(MOTORISTA_FINANCEIRO_QUERY_KEY, {
          ...previousConfig,
          ...newConfig,
        });
      }

      return { previousConfig };
    },
    onError: (_err, _newConfig, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(MOTORISTA_FINANCEIRO_QUERY_KEY, context.previousConfig);
      }
      toast.error("Não foi possível salvar as configurações de recebimento.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MOTORISTA_FINANCEIRO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
    },
  });

  return {
    financeiro: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateFinanceiro: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
