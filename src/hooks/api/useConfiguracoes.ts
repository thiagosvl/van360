import { apiClient } from "@/services/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ConfiguracoesUsuario {
  notificar_pais_cobrancas: boolean;
  notificar_motorista_parcelas: boolean;
  notificar_motorista_aniversarios: boolean;
  notificar_inicio_rota: boolean;
  notificar_proxima_parada: boolean;
  notificar_conclusao_parada: boolean;
  rastreamento_ativo: boolean;
  rastreamento_modo: "completo" | "apenas_proximo";
  chave_pix: string | null;
  tipo_chave_pix: string | null;
}

export type UpdateConfiguracoesInput = Partial<
  Pick<
    ConfiguracoesUsuario,
    | "notificar_pais_cobrancas"
    | "notificar_motorista_parcelas"
    | "notificar_motorista_aniversarios"
    | "notificar_inicio_rota"
    | "notificar_proxima_parada"
    | "notificar_conclusao_parada"
    | "rastreamento_ativo"
    | "rastreamento_modo"
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

      return { previousConfig };
    },
    onError: (_err, _newConfig, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(CONFIGURACOES_QUERY_KEY, context.previousConfig);
      }
      toast.error("Erro ao salvar alteração. Tente novamente.");
    },
    onSuccess: () => {
      toast.success("Configuração atualizada com sucesso!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CONFIGURACOES_QUERY_KEY });
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
