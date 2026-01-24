import { gastoApi } from "@/services/api/gasto.api";
import { getErrorMessage } from "@/utils/errorHandler";
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
    onError: (error: any) => {
      toast.error("gasto.erro.atualizar", {
        description: getErrorMessage(error, "Não foi possível atualizar o gasto."),
      });
    },
    onSuccess: () => {
      toast.success("gasto.sucesso.atualizado");
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

export function useDeleteGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gastoApi.deleteGasto(id),
    onError: (error: any) => {
      toast.error("gasto.erro.excluir", {
        description: getErrorMessage(error, "Não foi possível excluir o gasto."),
      });
    },
    onSuccess: () => {
      toast.success("gasto.sucesso.excluido");
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

