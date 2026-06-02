import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { toast } from "@/utils/notifications/toast";
import { getErrorMessage } from "@/utils/errorHandler";
import { RouteStopStatus } from "@/types/route";

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => routeApi.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
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
      toast.success("Rota atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useDeleteRoute(usuarioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routeApi.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
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
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route-execution", data.id] });
      toast.success("Rota iniciada com sucesso!");
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
      passageiroId,
      status
    }: {
      execucaoId: string;
      passageiroId: string;
      status: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE;
    }) => routeApi.atualizarParadaStatus(execucaoId, passageiroId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route-execution", variables.execucaoId] });
      if (variables.status === RouteStopStatus.EMBARCADO) {
        toast.success("Passageiro marcado como embarcado/desembarcado!");
      } else {
        toast.success("Passageiro pulado na rota!");
      }
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status da parada", {
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
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route-execution", data.id] });
      toast.success("Rota cancelada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao cancelar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}
