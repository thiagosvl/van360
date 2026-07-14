import { passageiroApi } from "@/services/api/passageiro.api";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Passageiro } from "@/types/passageiro";

export function useCreatePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Passageiro> & { usuario_id: string }) => passageiroApi.createPassageiro(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Passageiro> }) =>
      passageiroApi.updatePassageiro(id, data),
    onError: (error: any, variables) => {
      toast.error("passageiro.erro.atualizar", {
        description: getErrorMessage(error, "passageiro.erro.atualizarDetalhe"),
      });
    },
    onSuccess: (data, variables) => {
      toast.success("sucesso.atualizar");

      // Invalidações globais
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });

      // Se payload tem escola_id ou veiculo_id, invalidamos as listas para atualizar a contagem
      if (variables.data?.escola_id !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["escolas"] });
      }
      if (variables.data?.veiculo_id !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      }
    },
  });
}

export function useDeletePassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => passageiroApi.deletePassageiro(id),
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error);

      if (error?.response?.status === 400 || errorMessage) {
        toast.error("passageiro.erro.excluir", {
          description: errorMessage
        });
      } else {
        toast.error("passageiro.erro.excluir", {
          description: "passageiro.erro.excluirDetalhe",
        });
      }
    },
    onSuccess: () => {
      toast.success("passageiro.sucesso.excluido");
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });

      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
    },
  });
}

export function useToggleAtivoPassageiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: boolean }) =>
      passageiroApi.toggleAtivo(id, novoStatus),
    onError: (error: any, variables) => {
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
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["cobranca"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
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
      data: Partial<Passageiro> & { usuario_id: string; };
    }) =>
      passageiroApi.finalizePreCadastro(
        prePassageiroId,
        data,
        data.usuario_id
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["pre-passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["aniversariantes"] });
      toast.success("passageiro.sucesso.criado");
    },
    onError: (error: any) => {
      toast.error("passageiro.erro.criar", {
        description: getErrorMessage(error, "passageiro.erro.confirmarDetalhe"),
      });
    },
  });
}

export function useCreateResponsavelAdicional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ passageiroId, data }: { passageiroId: string; data: any }) =>
      passageiroApi.addResponsavelAdicional(passageiroId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.passageiroId] });
      toast.success("sucesso.adicionar");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar responsável", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateResponsavelAdicional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responsavelId, passageiroId, data }: { responsavelId: string; passageiroId: string; data: any }) =>
      passageiroApi.updateResponsavelAdicional(responsavelId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.passageiroId] });
      toast.success("sucesso.atualizar");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar responsável", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteResponsavelAdicional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responsavelId, passageiroId }: { responsavelId: string; passageiroId: string }) =>
      passageiroApi.deleteResponsavelAdicional(responsavelId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.passageiroId] });
      toast.success("sucesso.excluir");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir responsável", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useSetPrincipalResponsavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ passageiroId, responsavelId }: { passageiroId: string; responsavelId: string }) =>
      passageiroApi.setPrincipalResponsavel(passageiroId, responsavelId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.passageiroId] });
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      toast.success("sucesso.atualizar");
    },
    onError: (error: any) => {
      toast.error("Erro ao alterar responsável principal", {
        description: getErrorMessage(error),
      });
    },
  });
}

