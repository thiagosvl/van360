import { veiculoApi } from "@/services/api/veiculo.api";
import { Veiculo } from "@/types/veiculo";
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["veiculos"] });

      const previousVeiculos = queryClient.getQueriesData({ queryKey: ["veiculos"] });

      queryClient.setQueriesData({ queryKey: ["veiculos"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.map((v: Veiculo) => (v.id === id ? { ...v, ...data } : v)),
          };
        }
        return old;
      });

      return { previousVeiculos };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousVeiculos) {
        context.previousVeiculos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("veiculo.erro.atualizar", {
        description: getErrorMessage(error, "veiculo.erro.atualizarDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("veiculo.sucesso.atualizado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
    },
  });
}

export function useDeleteVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => veiculoApi.deleteVeiculo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["veiculos"] });

      const previousVeiculos = queryClient.getQueriesData({ queryKey: ["veiculos"] });

      queryClient.setQueriesData({ queryKey: ["veiculos"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.filter((v: Veiculo) => v.id !== id),
            total: old.total - 1,
            ativos: old.list.filter((v: Veiculo) => v.id !== id && v.ativo).length,
          };
        }
        return old;
      });

      return { previousVeiculos };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousVeiculos) {
        context.previousVeiculos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("veiculo.erro.excluir", {
        description: getErrorMessage(error, "veiculo.erro.excluirDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("veiculo.sucesso.excluido");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
    },
  });
}

export function useToggleAtivoVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: boolean }) =>
      veiculoApi.updateVeiculo(id, { ativo: novoStatus }),
    onMutate: async ({ id, novoStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["veiculos"] });

      const previousVeiculos = queryClient.getQueriesData({ queryKey: ["veiculos"] });

      queryClient.setQueriesData({ queryKey: ["veiculos"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.map((v: Veiculo) =>
              v.id === id ? { ...v, ativo: novoStatus } : v
            ),
            ativos: old.list.filter((v: Veiculo) => {
              if (v.id === id) return novoStatus;
              return v.ativo;
            }).length,
          };
        }
        return old;
      });

      return { previousVeiculos };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousVeiculos) {
        context.previousVeiculos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("veiculo.erro.alterarStatus", {
        description: getErrorMessage(error, "veiculo.erro.alterarStatusDetalhe"),
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.novoStatus ? "veiculo.sucesso.ativado" : "veiculo.sucesso.desativado"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-form"] });
    },
  });
}

