import { escolaApi } from "@/services/api/escola.api";
import { Escola } from "@/types/escola";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: any }) =>
      escolaApi.createEscola(usuarioId, data),
    onSuccess: (data: any) => {
            // Optimistic update for lists
      queryClient.setQueriesData({ queryKey: ["escolas"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: [data, ...old.list],
            total: old.total + 1,
            ativas: old.ativas + (data.ativo ? 1 : 0),
          };
        }
        return old;
      });
      // Also update form-specific lists
      queryClient.setQueriesData({ queryKey: ["escolas-form"] }, (old: any) => {
        if (!old || !Array.isArray(old)) return [data];
        return [...old, data];
      });

      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("escola.sucesso.criada");
    },
    // onError: (error: any) => {
    //   toast.error("escola.erro.criar", {
    //     description: error.message || "Não foi possível criar a escola.",
    //   });
    // },
  });
}

export function useUpdateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      escolaApi.updateEscola(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["escolas"] });

      const previousEscolas = queryClient.getQueriesData({ queryKey: ["escolas"] });

      queryClient.setQueriesData({ queryKey: ["escolas"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.map((e: Escola) => (e.id === id ? { ...e, ...data } : e)),
          };
        }
        return old;
      });

      return { previousEscolas };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousEscolas) {
        context.previousEscolas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("escola.erro.atualizar", {
        description: getErrorMessage(error, "escola.erro.atualizarDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("escola.sucesso.atualizada");
    },
    onSettled: (data, error) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["escolas"] });
        queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      }
    },
  });
}

export function useDeleteEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => escolaApi.deleteEscola(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["escolas"] });

      const previousEscolas = queryClient.getQueriesData({ queryKey: ["escolas"] });

      queryClient.setQueriesData({ queryKey: ["escolas"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.filter((e: Escola) => e.id !== id),
            total: old.total - 1,
            ativas: old.list.filter((e: Escola) => e.id !== id && e.ativo).length,
          };
        }
        return old;
      });

      return { previousEscolas };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousEscolas) {
        context.previousEscolas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("escola.erro.excluir", {
        description: getErrorMessage(error, "escola.erro.excluirDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("escola.sucesso.excluida");
    },
    onSettled: (data, error) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["escolas"] });
        queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      }
    },
  });
}

export function useToggleAtivoEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: boolean }) =>
      escolaApi.updateEscola(id, { ativo: novoStatus }),
    onMutate: async ({ id, novoStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["escolas"] });

      const previousEscolas = queryClient.getQueriesData({ queryKey: ["escolas"] });

      queryClient.setQueriesData({ queryKey: ["escolas"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.map((e: Escola) =>
              e.id === id ? { ...e, ativo: novoStatus } : e
            ),
            ativas: old.list.filter((e: Escola) => {
              if (e.id === id) return novoStatus;
              return e.ativo;
            }).length,
          };
        }
        return old;
      });

      return { previousEscolas };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousEscolas) {
        context.previousEscolas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("escola.erro.alterarStatus", {
        description: getErrorMessage(error, "escola.erro.alterarStatusDetalhe"),
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.novoStatus ? "escola.sucesso.ativada" : "escola.sucesso.desativada"
      );
    },
    onSettled: (data, error) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["escolas"] });
        queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      }
    },
  });
}

