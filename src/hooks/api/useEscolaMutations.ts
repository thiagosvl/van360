import { escolaApi } from "@/services/api/escola.api";
import { Escola } from "@/types/escola";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: any }) =>
      escolaApi.createEscola(usuarioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
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
        description: error.message || "Não foi possível atualizar a escola.",
      });
    },
    onSuccess: () => {
      toast.success("escola.sucesso.atualizada");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
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
        description: error.message || "Não foi possível excluir a escola.",
      });
    },
    onSuccess: () => {
      toast.success("escola.sucesso.excluida");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
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
        description: error.message || "Não foi possível alterar o status.",
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.novoStatus ? "escola.sucesso.ativada" : "escola.sucesso.desativada"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
    },
  });
}

