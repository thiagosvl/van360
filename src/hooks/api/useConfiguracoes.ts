import { apiClient } from "@/services/api/client";
import { Usuario } from "@/types/usuario";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ConfiguracoesUsuario {
  notificar_pais_cobrancas: boolean;
  cobranca_aviso_previo_ativo: boolean;
  cobranca_aviso_previo_whatsapp_ativo?: boolean;
  cobranca_dias_aviso_previo: number | null;
  cobranca_vencimento_hoje_ativo: boolean;
  cobranca_atraso_3_dias_ativo: boolean;
  cobranca_atraso_5_dias_ativo: boolean;
  cobranca_atraso_7_dias_ativo: boolean;
  dias_aviso_vencimento_padrao_sistema?: number;
  notificar_motorista_parcelas: boolean;
  notificar_motorista_aniversarios: boolean;
  notificar_inicio_rota: boolean;
  notificar_proxima_parada: boolean;
  notificar_conclusao_parada: boolean;
  rastreamento_ativo: boolean;
  rastreamento_modo: "completo" | "apenas_proximo";
  formato_nome_responsavel?: "primeiro_nome" | "completo";
  exibir_telefone_lista_alunos?: boolean;
  chave_pix: string | null;
  tipo_chave_pix: string | null;
}

export type UpdateConfiguracoesInput = Partial<
  Pick<
    ConfiguracoesUsuario,
    | "notificar_pais_cobrancas"
    | "cobranca_aviso_previo_ativo"
    | "cobranca_dias_aviso_previo"
    | "cobranca_vencimento_hoje_ativo"
    | "cobranca_atraso_3_dias_ativo"
    | "cobranca_atraso_5_dias_ativo"
    | "cobranca_atraso_7_dias_ativo"
    | "notificar_motorista_parcelas"
    | "notificar_motorista_aniversarios"
    | "notificar_inicio_rota"
    | "notificar_proxima_parada"
    | "notificar_conclusao_parada"
    | "rastreamento_ativo"
    | "rastreamento_modo"
    | "formato_nome_responsavel"
    | "exibir_telefone_lista_alunos"
  >
>;

const CONFIGURACOES_QUERY_KEY = ["configuracoes"];

export function useConfiguracoes() {
  const queryClient = useQueryClient();

  const query = useQuery<ConfiguracoesUsuario>({
    queryKey: CONFIGURACOES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ConfiguracoesUsuario>("/usuarios/configuracoes");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async (payload: UpdateConfiguracoesInput) => {
      const { data } = await apiClient.put<ConfiguracoesUsuario>("/usuarios/configuracoes", payload);
      return data;
    },
    onMutate: async (newConfig) => {
      await queryClient.cancelQueries({ queryKey: CONFIGURACOES_QUERY_KEY });
      const previousConfig = queryClient.getQueryData<ConfiguracoesUsuario>(CONFIGURACOES_QUERY_KEY);

      if (previousConfig) {
        queryClient.setQueryData<ConfiguracoesUsuario>(CONFIGURACOES_QUERY_KEY, {
          ...previousConfig,
          ...newConfig,
        });
      }

      if (newConfig.formato_nome_responsavel !== undefined || newConfig.exibir_telefone_lista_alunos !== undefined) {
        queryClient.setQueriesData({ queryKey: ["profile"] }, (oldProfile: Usuario | undefined) => {
          if (!oldProfile) return oldProfile;
          return {
            ...oldProfile,
            configuracoes: {
              ...(oldProfile.configuracoes || {}),
              ...(newConfig.formato_nome_responsavel !== undefined ? { formato_nome_responsavel: newConfig.formato_nome_responsavel } : {}),
              ...(newConfig.exibir_telefone_lista_alunos !== undefined ? { exibir_telefone_lista_alunos: newConfig.exibir_telefone_lista_alunos } : {}),
            },
          };
        });
      }

      return { previousConfig };
    },
    onError: (_err, _newConfig, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(CONFIGURACOES_QUERY_KEY, context.previousConfig);
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.error("Não foi possível salvar a alteração. Tente novamente.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CONFIGURACOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    configuracoes: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateConfiguracoes: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
