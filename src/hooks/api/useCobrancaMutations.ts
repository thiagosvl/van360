import { cobrancaApi } from "@/services/api/cobranca.api";
import { Cobranca } from "@/types/cobranca";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => cobrancaApi.createCobranca(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"] });
      // Invalida anos disponíveis (pode ter mudado após criar cobrança)
      queryClient.invalidateQueries({ queryKey: ["available-years"] });
      toast.success("cobranca.sucesso.criada");
    },
    onError: (error: any) => {
      const isDuplicate =
        error?.response?.data?.message?.includes('cobrancas_passageiro_id_mes_ano_key') ||
        error?.response?.data?.error?.includes('cobrancas_passageiro_id_mes_ano_key');
    
      if (isDuplicate) {
        toast.error("cobranca.erro.criar", {
          description: "cobranca.erro.jaExiste",
        });
        return;
      }
    
      toast.error("cobranca.erro.criar", {
        description: getErrorMessage(error, "cobranca.erro.criarDetalhe"),
      });
    },
  });
}

export function useUpdateCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, cobrancaOriginal }: { id: string; data: any; cobrancaOriginal?: any }) =>
      cobrancaApi.updateCobranca(id, data, cobrancaOriginal),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["cobrancas"] });
      await queryClient.cancelQueries({ queryKey: ["cobrancas-by-passageiro"] });

      const previousCobrancas = queryClient.getQueriesData({ queryKey: ["cobrancas"] });
      const previousCobrancasByPassageiro = queryClient.getQueriesData({ queryKey: ["cobrancas-by-passageiro"] });

      queryClient.setQueriesData({ queryKey: ["cobrancas"] }, (old: any) => {
        if (!old) return old;
        const updated = { ...old };
        if (updated.all) {
          updated.all = updated.all.map((c: Cobranca) =>
            c.id === id ? { ...c, ...data } : c
          );
        }
        if (updated.abertas) {
          updated.abertas = updated.abertas.map((c: Cobranca) =>
            c.id === id ? { ...c, ...data } : c
          );
        }
        if (updated.pagas) {
          updated.pagas = updated.pagas.map((c: Cobranca) =>
            c.id === id ? { ...c, ...data } : c
          );
        }
        return updated;
      });

      queryClient.setQueriesData({ queryKey: ["cobrancas-by-passageiro"] }, (old: any) => {
        if (!old) return old;
        return old.map((c: Cobranca) => (c.id === id ? { ...c, ...data } : c));
      });

      return { previousCobrancas, previousCobrancasByPassageiro };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousCobrancas) {
        context.previousCobrancas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousCobrancasByPassageiro) {
        context.previousCobrancasByPassageiro.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("cobranca.erro.atualizar", {
        description: getErrorMessage(error, "cobranca.erro.atualizarDetalhe"),
      });
    },
    onSuccess: (_, variables) => {
      // Invalida query específica da cobrança atualizada
      queryClient.invalidateQueries({ queryKey: ["cobranca", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"] });
      toast.success("cobranca.sucesso.atualizada");
    },
  });
}

export function useDeleteCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cobrancaApi.deleteCobranca(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cobrancas"] });
      await queryClient.cancelQueries({ queryKey: ["cobrancas-by-passageiro"] });

      const previousCobrancas = queryClient.getQueriesData({ queryKey: ["cobrancas"] });
      const previousCobrancasByPassageiro = queryClient.getQueriesData({ queryKey: ["cobrancas-by-passageiro"] });

      queryClient.setQueriesData({ queryKey: ["cobrancas"] }, (old: any) => {
        if (!old) return old;
        const updated = { ...old };
        if (updated.all) {
          updated.all = updated.all.filter((c: Cobranca) => c.id !== id);
        }
        if (updated.abertas) {
          updated.abertas = updated.abertas.filter((c: Cobranca) => c.id !== id);
        }
        if (updated.pagas) {
          updated.pagas = updated.pagas.filter((c: Cobranca) => c.id !== id);
        }
        return updated;
      });

      queryClient.setQueriesData({ queryKey: ["cobrancas-by-passageiro"] }, (old: any) => {
        if (!old) return old;
        return old.filter((c: Cobranca) => c.id !== id);
      });

      return { previousCobrancas, previousCobrancasByPassageiro };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousCobrancas) {
        context.previousCobrancas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousCobrancasByPassageiro) {
        context.previousCobrancasByPassageiro.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("cobranca.erro.excluir", {
        description: getErrorMessage(error, "cobranca.erro.excluirDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("cobranca.sucesso.excluida");
    },
    onSettled: (data, error, id) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
        queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"] });
        // Invalida a query específica da cobrança excluída para garantir que não seja mais acessível
        if (id) {
            queryClient.invalidateQueries({ queryKey: ["cobranca", id] });
            // Remove do cache para evitar acesso após exclusão
            queryClient.removeQueries({ queryKey: ["cobranca", id] });
        }
        // Invalida anos disponíveis (pode ter mudado após excluir cobrança)
        queryClient.invalidateQueries({ queryKey: ["available-years"] });
      }
    },
  });
}

export function useDesfazerPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cobrancaId: string) => cobrancaApi.desfazerPagamento(cobrancaId),
    onSuccess: (updatedCobranca, cobrancaId) => {
      // Atualiza o cache da cobrança específica imediatamente, fazendo merge com dados existentes
      queryClient.setQueryData(["cobranca", cobrancaId], (old: Cobranca | undefined) => {
        if (!old) return updatedCobranca;
        // Faz merge mantendo os dados existentes (como passageiros) e atualizando apenas os campos modificados
        return {
          ...old,
          ...updatedCobranca,
          // Preserva passageiro se não vier na resposta
          passageiro: updatedCobranca.passageiro || old.passageiro,
        } as Cobranca;
      });
      
      // Invalida todas as queries de cobranças (incluindo as com filtros) para refetch
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      // Invalida todas as queries de cobranças por passageiro (incluindo as com passageiroId e ano)
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      // Invalida query específica da cobrança para garantir refetch se necessário
      queryClient.invalidateQueries({ queryKey: ["cobranca", cobrancaId], refetchType: "active" });
      toast.success("cobranca.sucesso.pagamentoDesfeito");
    },
    onError: (error: any) => {
      toast.error("cobranca.erro.desfazerPagamento", {
        description: getErrorMessage(error, "cobranca.erro.desfazerPagamentoDetalhe"),
      });
    },
  });
}

export function useRegistrarPagamentoManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cobrancaId, data }: { cobrancaId: string; data: any }) =>
      cobrancaApi.registrarPagamentoManual(cobrancaId, data),
    onSuccess: (updatedCobranca, { cobrancaId }) => {
      // Atualiza o cache da cobrança específica imediatamente, fazendo merge com dados existentes
      queryClient.setQueryData(["cobranca", cobrancaId], (old: Cobranca | undefined) => {
        if (!old) return updatedCobranca;
        // Faz merge mantendo os dados existentes (como passageiros) e atualizando apenas os campos modificados
        return {
          ...old,
          ...updatedCobranca,
          // Preserva passageiro se não vier na resposta
          passageiro: updatedCobranca.passageiro || old.passageiro,
        } as Cobranca;
      });
      
      // Invalida todas as queries de cobranças (incluindo as com filtros) para refetch
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      // Invalida todas as queries de cobranças por passageiro (incluindo as com passageiroId e ano)
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      // Invalida query específica da cobrança para garantir refetch se necessário
      queryClient.invalidateQueries({ queryKey: ["cobranca", cobrancaId], refetchType: "active" });
      toast.success("cobranca.sucesso.pagamentoRegistrado");
    },
    onError: (error: any) => {
      toast.error("cobranca.erro.registrarPagamento", {
        description: getErrorMessage(error, "cobranca.erro.registrarPagamentoDetalhe"),
      });
    },
  });
}

export function useEnviarNotificacaoCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cobrancaId: string) => cobrancaApi.enviarNotificacaoByCobrancaId(cobrancaId),
    onSuccess: (_, cobrancaId) => {
      // Invalida todas as queries de cobranças para atualizar listas
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      // Invalida query específica da cobrança para atualizar detalhes
      queryClient.invalidateQueries({ queryKey: ["cobranca", cobrancaId], refetchType: "active" });
      // Invalida notificações da cobrança para atualizar histórico
      queryClient.invalidateQueries({ queryKey: ["cobranca-notificacoes", cobrancaId], refetchType: "active" });
      toast.success("cobranca.sucesso.notificacaoEnviada");
    },
    onError: (error: any) => {
      toast.error("cobranca.erro.notificacao", {
        description: getErrorMessage(error, "cobranca.erro.notificacaoDetalhe"),
      });
    },
  });
}

export function useToggleNotificacoesCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cobrancaId, desativar }: { cobrancaId: string; desativar: boolean }) =>
      cobrancaApi.toggleNotificacoes(cobrancaId, desativar),
    onSuccess: (data, variables) => {
      // Invalida todas as queries de cobranças para atualizar listas
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      // Invalida query específica da cobrança para atualizar detalhes
      queryClient.invalidateQueries({ queryKey: ["cobranca", variables.cobrancaId], refetchType: "active" });
      // Invalida notificações da cobrança para atualizar histórico (pode ter mudado o estado)
      queryClient.invalidateQueries({ queryKey: ["cobranca-notificacoes", variables.cobrancaId], refetchType: "active" });
      toast.success(
        variables.desativar
          ? "cobranca.sucesso.notificacoesDesativadas"
          : "cobranca.sucesso.notificacoesAtivadas"
      );
    },
    onError: (error: any) => {
      toast.error("cobranca.erro.alterarNotificacoes", {
        description: getErrorMessage(error, "cobranca.erro.alterarNotificacoesDetalhe"),
      });
    },
  });
}

