import { gastoApi } from "@/services/api/gasto.api";
import { Gasto } from "@/types/gasto";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: any }) =>
      gastoApi.createGasto(usuarioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      toast.success("gasto.sucesso.criado");
    },
    onError: (error: any) => {
      toast.error("gasto.erro.criar", {
        description: getErrorMessage(error, "Não foi possível criar o gasto."),
      });
    },
  });
}

export function useUpdateGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      gastoApi.updateGasto(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["gastos"] });

      const previousGastos = queryClient.getQueriesData({ queryKey: ["gastos"] });

      queryClient.setQueriesData({ queryKey: ["gastos"] }, (old: any) => {
        if (!old) return old;
        return old.map((g: Gasto) => (g.id === id ? { ...g, ...data } : g));
      });

      return { previousGastos };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousGastos) {
        context.previousGastos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("gasto.erro.atualizar", {
        description: getErrorMessage(error, "Não foi possível atualizar o gasto."),
      });
    },
    onSuccess: () => {
      toast.success("gasto.sucesso.atualizado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

export function useDeleteGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gastoApi.deleteGasto(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["gastos"] });

      const previousGastos = queryClient.getQueriesData({ queryKey: ["gastos"] });

      queryClient.setQueriesData({ queryKey: ["gastos"] }, (old: any) => {
        if (!old) return old;
        return old.filter((g: Gasto) => g.id !== id);
      });

      return { previousGastos };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousGastos) {
        context.previousGastos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("gasto.erro.excluir", {
        description: getErrorMessage(error, "Não foi possível excluir o gasto."),
      });
    },
    onSuccess: () => {
      toast.success("gasto.sucesso.excluido");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

