import { prePassageiroApi } from "@/services/api/pre-passageiro.api";
import { PrePassageiro } from "@/types/prePassageiro";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePrePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => prePassageiroApi.createPrePassageiro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("prePassageiro.sucesso.linkGerado");
    },
    onError: (error: any) => {
      toast.error("prePassageiro.erro.gerarLink", {
        description: getErrorMessage(error, "Não foi possível criar o registro temporário."),
      });
    },
  });
}

export function useDeletePrePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => prePassageiroApi.deletePrePassageiro(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["pre-passageiros"] });

      const previousPrePassageiros = queryClient.getQueriesData({ queryKey: ["pre-passageiros"] });

      queryClient.setQueriesData({ queryKey: ["pre-passageiros"] }, (old: any) => {
        if (!old) return old;
        return old.filter((p: PrePassageiro) => p.id !== id);
      });

      return { previousPrePassageiros };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPrePassageiros) {
        context.previousPrePassageiros.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("prePassageiro.erro.excluir", {
        description: getErrorMessage(error, "Não foi possível concluir a operação."),
      });
    },
    onSuccess: () => {
      toast.success("prePassageiro.sucesso.excluido");
    },
    onSettled: (data, error) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["pre-passageiros"] });
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      }
    },
  });
}

