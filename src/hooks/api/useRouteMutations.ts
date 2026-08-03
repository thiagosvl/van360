import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { toast } from "@/utils/notifications/toast";
import { getErrorMessage } from "@/utils/errorHandler";
import { RouteStopStatus } from "@/types/route";

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => routeApi.createRoute(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.refetchQueries({ queryKey: ["routes"] });
      toast.success("Rota criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      routeApi.updateRoute(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["route-execution", variables.id] });
      queryClient.refetchQueries({ queryKey: ["routes"] });
      toast.success("Rota atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useDeleteRoute(usuarioId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routeApi.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.refetchQueries({ queryKey: ["routes"] });
      toast.success("Rota excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useIniciarRota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routeApi.iniciarRota(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["route-execution", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route-execution", data.id] });
      if (data.alertaInativos) {
        toast.info("Atenção na inicialização", { description: data.alertaInativos });
      }
    },
    onError: (error: any) => {
      toast.error("Não foi possível iniciar a rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useAtualizarParadaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      execucaoId,
      paradaId,
      status
    }: {
      execucaoId: string;
      paradaId: string;
      status: RouteStopStatus;
    }) => routeApi.atualizarParadaStatus(execucaoId, paradaId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route-execution", variables.execucaoId] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status da parada", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useReordenarExecucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      execucaoId,
      paradas
    }: {
      execucaoId: string;
      paradas: Array<{ id: string; ordem: number }>;
    }) => routeApi.reordenarExecucao(execucaoId, paradas),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route-execution", variables.execucaoId] });
      toast.success("Ordem dos itinerários atualizada!");
    },
    onError: (error: any) => {
      toast.error("Erro ao reordenar itinerário", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useCancelarExecucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routeApi.cancelarExecucao(id),
    onSuccess: (data) => {
      queryClient.setQueriesData({ queryKey: ["routes", "execucoes"] }, (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((e: any) => (e.id === data.id ? { ...e, status: data.status } : e));
      });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.removeQueries({ queryKey: ["route-execution", data.id] });
      toast.success("Rota encerrada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao encerrar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useFinalizarExecucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routeApi.finalizarExecucao(id),
    onSuccess: (data) => {
      queryClient.setQueriesData({ queryKey: ["routes", "execucoes"] }, (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((e: any) => (e.id === data.id ? { ...e, status: data.status } : e));
      });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.removeQueries({ queryKey: ["route-execution", data.id] });
    },
    onError: (error: any) => {
      toast.error("Erro ao finalizar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}
