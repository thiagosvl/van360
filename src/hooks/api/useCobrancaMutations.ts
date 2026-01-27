import { cobrancaApi } from "@/services/api/cobranca.api";
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
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
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
    onError: (error: any) => {
      toast.error("cobranca.erro.atualizar", {
        description: getErrorMessage(error, "cobranca.erro.atualizarDetalhe"),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cobranca", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("cobranca.sucesso.atualizada");
    },
  });
}

export function useDeleteCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cobrancaApi.deleteCobranca(id),
    onError: (error: any) => {
      toast.error("cobranca.erro.excluir", {
        description: getErrorMessage(error, "cobranca.erro.excluirDetalhe"),
      });
    },
    onSuccess: (_, id) => {
      toast.success("cobranca.sucesso.excluida");
      
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"] });
      
      if (id) {
          queryClient.removeQueries({ queryKey: ["cobranca", id] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["available-years"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useDesfazerPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cobrancaId: string) => cobrancaApi.desfazerPagamento(cobrancaId),
    onSuccess: (updatedCobranca, cobrancaId) => {
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobranca-notificacoes", cobrancaId], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
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
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobranca", cobrancaId], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
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
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobranca", cobrancaId], refetchType: "active" });
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
      queryClient.invalidateQueries({ queryKey: ["cobrancas"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobrancas-by-passageiro"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["cobranca", variables.cobrancaId], refetchType: "active" });
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

