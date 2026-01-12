import { passageiroApi } from "@/services/api/passageiro.api";
import { Passageiro } from "@/types/passageiro";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => passageiroApi.createPassageiro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros-contagem"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("passageiro.sucesso.criado");
    },
    onError: (error: any) => {
      toast.error("passageiro.erro.criar", {
        description: getErrorMessage(error, "passageiro.erro.criarDetalhe"),
      });
    },
  });
}

export function useUpdatePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      passageiroApi.updatePassageiro(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["passageiros"] });
      await queryClient.cancelQueries({ queryKey: ["passageiro", id] });

      const previousPassageiros = queryClient.getQueriesData({ queryKey: ["passageiros"] });
      const previousPassageiro = queryClient.getQueryData(["passageiro", id]) as Passageiro | undefined;

      // Armazenar valores anteriores de escola_id e veiculo_id para comparar depois
      const previousEscolaId = previousPassageiro?.escola_id;
      const previousVeiculoId = previousPassageiro?.veiculo_id;
      const newEscolaId = data.escola_id;
      const newVeiculoId = data.veiculo_id;

      queryClient.setQueriesData({ queryKey: ["passageiros"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.map((p: Passageiro) => (p.id === id ? { ...p, ...data } : p)),
          };
        }
        return old;
      });

      queryClient.setQueryData(["passageiro", id], (old: any) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { 
        previousPassageiros, 
        previousPassageiro,
        previousEscolaId,
        previousVeiculoId,
        newEscolaId,
        newVeiculoId,
      };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPassageiros) {
        context.previousPassageiros.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousPassageiro) {
        queryClient.setQueryData(["passageiro", variables.id], context.previousPassageiro);
      }
      toast.error("passageiro.erro.atualizar", {
        description: getErrorMessage(error, "passageiro.erro.atualizarDetalhe"),
      });
    },
    onSuccess: (data, variables) => {
      // Mensagem especial apenas para toggle de cobranças automáticas
      // O toggle envia apenas o campo enviar_cobranca_automatica (1 campo)
      // O formulário de edição envia todos os campos (muitos campos)
      const dataKeys = Object.keys(variables.data || {});
      const isToggleOnly = 
        dataKeys.length === 1 && 
        dataKeys[0] === "enviar_cobranca_automatica" &&
        variables.data.enviar_cobranca_automatica !== undefined;
      
      if (isToggleOnly) {
        toast.success(
          variables.data.enviar_cobranca_automatica
            ? "sistema.sucesso.cobrancasAutomaticasAtivadas"
            : "sistema.sucesso.cobrancasAutomaticasDesativadas"
        );
      } else {
        toast.success("passageiro.sucesso.atualizado");
      }
    },
    onSettled: (data, error, variables, context) => {
      // Sempre invalidar queries de passageiros e cobranças
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros-contagem"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });

      // Invalidar escolas/veículos apenas se houve mudança de escola/veículo
      // Isso evita requisições desnecessárias quando apenas outros campos são editados
      const escolaIdChanged = context?.previousEscolaId !== context?.newEscolaId;
      const veiculoIdChanged = context?.previousVeiculoId !== context?.newVeiculoId;

      if (escolaIdChanged) {
        queryClient.invalidateQueries({ queryKey: ["escolas"] });
      }
      if (veiculoIdChanged) {
        queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      }
    },
  });
}

export function useDeletePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => passageiroApi.deletePassageiro(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["passageiros"] });

      const previousPassageiros = queryClient.getQueriesData({ queryKey: ["passageiros"] });

      queryClient.setQueriesData({ queryKey: ["passageiros"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.filter((p: Passageiro) => p.id !== id),
            total: old.total - 1,
            ativos: old.list.filter((p: Passageiro) => p.id !== id && p.ativo).length,
          };
        }
        return old;
      });

      return { previousPassageiros };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPassageiros) {
        context.previousPassageiros.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Tratamento temporário: detecta erro de foreign key constraint relacionado a cobranças
      // TODO: Backend deve validar antes de tentar deletar e retornar erro específico
      const errorMessage = getErrorMessage(error);
      const isConstraintError = 
        errorMessage.includes("foreign key constraint") || 
        errorMessage.includes("cobrancas") ||
        errorMessage.toLowerCase().includes("violates foreign key");
      
      if (isConstraintError) {
        toast.error("passageiro.erro.excluir", {
          description: "passageiro.erro.excluirComCobrancas",
        });
      } else {
        toast.error("passageiro.erro.excluir", {
          description: errorMessage || "passageiro.erro.excluirDetalhe",
        });
      }
    },
    onSuccess: () => {
      toast.success("passageiro.sucesso.excluido");
    },
    onSettled: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros-contagem"] });
      // Invalida a query específica do passageiro excluído para garantir que não seja mais acessível
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["passageiro", id] });
        // Remove do cache para evitar acesso após exclusão
        queryClient.removeQueries({ queryKey: ["passageiro", id] });
        // Remove também queries relacionadas (cobranças do passageiro, anos disponíveis)
        queryClient.removeQueries({ queryKey: ["cobrancas-by-passageiro", id] });
        queryClient.removeQueries({ queryKey: ["available-years", id] });
      }
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useToggleAtivoPassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: boolean }) =>
      passageiroApi.toggleAtivo(id, novoStatus),
    onMutate: async ({ id, novoStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["passageiros"] });
      await queryClient.cancelQueries({ queryKey: ["passageiro", id] });

      const previousPassageiros = queryClient.getQueriesData({ queryKey: ["passageiros"] });
      const previousPassageiro = queryClient.getQueryData(["passageiro", id]);

      queryClient.setQueriesData({ queryKey: ["passageiros"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: old.list.map((p: Passageiro) =>
              p.id === id ? { ...p, ativo: novoStatus } : p
            ),
            ativos: old.list.filter((p: Passageiro) => {
              if (p.id === id) return novoStatus;
              return p.ativo;
            }).length,
          };
        }
        return old;
      });

      queryClient.setQueryData(["passageiro", id], (old: any) => {
        if (!old) return old;
        return { ...old, ativo: novoStatus };
      });

      return { previousPassageiros, previousPassageiro };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPassageiros) {
        context.previousPassageiros.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousPassageiro) {
        queryClient.setQueryData(["passageiro", variables.id], context.previousPassageiro);
      }
      toast.error(
        variables.novoStatus ? "passageiro.erro.ativar" : "passageiro.erro.desativar",
        {
          description: getErrorMessage(error, "passageiro.erro.statusDetalhe"),
        }
      );
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.novoStatus ? "passageiro.sucesso.ativado" : "passageiro.sucesso.desativado"
      );
    },
    onSettled: (data, error, variables) => {
      // Sempre invalidar queries de passageiros e cobranças
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros-contagem"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Quando toggle de ativo, a contagem de passageiros nas escolas/veículos muda
      // então precisamos invalidar essas queries
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useFinalizePreCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      prePassageiroId,
      data,
    }: {
      prePassageiroId: string;
      data: any & { usuario_id: string; emitir_cobranca_mes_atual: boolean };
    }) =>
      passageiroApi.finalizePreCadastro(
        prePassageiroId,
        data,
        data.usuario_id,
        data.emitir_cobranca_mes_atual
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros-contagem"] });
      queryClient.invalidateQueries({ queryKey: ["pre-passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("passageiro.sucesso.criado");
    },
    onError: (error: any) => {
      toast.error("passageiro.erro.criar", {
        description: getErrorMessage(error, "passageiro.erro.confirmarDetalhe"),
      });
    },
  });
}

