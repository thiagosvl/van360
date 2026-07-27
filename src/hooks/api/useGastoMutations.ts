import { gastoApi } from "@/services/api/gasto.api";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Gasto } from "@/types/gasto";
import { GastoEscopoAcao } from "@/types/enums";

export function useCreateGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: Partial<Gasto> }) =>
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
    mutationFn: ({ id, data, escopo }: { id: string; data: Partial<Gasto>; escopo?: GastoEscopoAcao }) =>
      gastoApi.updateGasto(id, data, escopo),
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
    mutationFn: ({ id, escopo }: { id: string; escopo?: GastoEscopoAcao }) =>
      gastoApi.deleteGasto(id, escopo),
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

