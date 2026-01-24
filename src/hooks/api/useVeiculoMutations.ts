import { veiculoApi } from "@/services/api/veiculo.api";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: any }) =>
      veiculoApi.createVeiculo(usuarioId, data),
    onSuccess: (data: any) => {
      // Optimistic update for lists
      queryClient.setQueriesData({ queryKey: ["veiculos"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: [data, ...old.list],
            total: old.total + 1,
            ativos: old.ativos + (data.ativo ? 1 : 0),
          };
        }
        return old;
      });
      // Also update form-specific lists
      queryClient.setQueriesData({ queryKey: ["veiculos-form"] }, (old: any) => {
        if (!old || !Array.isArray(old)) return [data];
        return [...old, data];
      });

      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("veiculo.sucesso.criado");
    },
    onError: (error: any) => {
      toast.error("veiculo.erro.criar", {
        description: getErrorMessage(error, "veiculo.erro.criarDetalhe"),
      });
    },
  });
}

export function useUpdateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      veiculoApi.updateVeiculo(id, data),
    onError: (error: any) => {
      toast.error("veiculo.erro.atualizar", {
        description: getErrorMessage(error, "veiculo.erro.atualizarDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("veiculo.sucesso.atualizado");
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useDeleteVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => veiculoApi.deleteVeiculo(id),
    onError: (error: any) => {
      toast.error("veiculo.erro.excluir", {
        description: getErrorMessage(error, "veiculo.erro.excluirDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("veiculo.sucesso.excluido");
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useToggleAtivoVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: boolean }) =>
      veiculoApi.updateVeiculo(id, { ativo: novoStatus }),
    onError: (error: any) => {
      toast.error("veiculo.erro.alterarStatus", {
        description: getErrorMessage(error, "veiculo.erro.alterarStatusDetalhe"),
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.novoStatus ? "veiculo.sucesso.ativado" : "veiculo.sucesso.desativado"
      );
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

