import { escolaApi } from "@/services/api/escola.api";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Escola } from "@/types/escola";

export function useCreateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: Partial<Escola> }) =>
      escolaApi.createEscola(usuarioId, data),
    onSuccess: (data: any) => {
      // Optimistic update for lists
      queryClient.setQueriesData({ queryKey: ["escolas"] }, (old: any) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: [data, ...old.list],
            total: old.total + 1,
            ativas: old.ativas + (data.ativo ? 1 : 0),
          };
        }
        return old;
      });
      // Also update form-specific lists
      queryClient.setQueriesData({ queryKey: ["escolas-form"] }, (old: any) => {
        if (!old || !Array.isArray(old)) return [data];
        return [...old, data];
      });

      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      toast.success("escola.sucesso.criada");
    },
  });
}

interface EscolasCacheData {
  list: Escola[];
  total: number;
  ativas: number;
}

export function useCreateEscolasBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, nomes }: { usuarioId: string; nomes: string[] }) =>
      escolaApi.createEscolasBatch(usuarioId, nomes),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Erro ao cadastrar escolas em lote"));
    },
    onSuccess: (novasEscolas: Escola[]) => {
      queryClient.setQueriesData<EscolasCacheData>({ queryKey: ["escolas"] }, (old) => {
        if (!old) return old;
        if (old.list) {
          return {
            ...old,
            list: [...novasEscolas, ...old.list],
            total: old.total + novasEscolas.length,
            ativas: old.ativas + novasEscolas.filter((e) => e.ativo).length,
          };
        }
        return old;
      });

      queryClient.setQueriesData<Escola[]>({ queryKey: ["escolas-form"] }, (old) => {
        if (!old || !Array.isArray(old)) return novasEscolas;
        return [...old, ...novasEscolas];
      });

      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });

      const count = novasEscolas.length;
      toast.success(
        count === 1
          ? "Escola cadastrada com sucesso!"
          : `${count} escolas cadastradas com sucesso!`
      );
    },
  });
}

export function useUpdateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Escola> }) =>
      escolaApi.updateEscola(id, data),
    onError: (error: any) => {
      toast.error("escola.erro.atualizar", {
        description: getErrorMessage(error, "escola.erro.atualizarDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("escola.sucesso.atualizada");
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useDeleteEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => escolaApi.deleteEscola(id),
    onError: (error: any) => {
      toast.error("escola.erro.excluir", {
        description: getErrorMessage(error, "escola.erro.excluirDetalhe"),
      });
    },
    onSuccess: () => {
      toast.success("escola.sucesso.excluida");
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

export function useToggleAtivoEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: boolean }) =>
      escolaApi.updateEscola(id, { ativo: novoStatus }),
    onError: (error: any) => {
      toast.error("escola.erro.alterarStatus", {
        description: getErrorMessage(error, "escola.erro.alterarStatusDetalhe"),
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.novoStatus ? "escola.sucesso.ativada" : "escola.sucesso.desativada"
      );
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["escolas-form"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
    },
  });
}

