import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { toast } from "@/utils/notifications/toast";
import { getErrorMessage } from "@/utils/errorHandler";
import { RouteStopStatus, RouteExecutionStatus } from "@/types/route";

let lastLocalMutationTime = 0;
const lastRealtimeSyncMap = new Map<string, number>();

export function markLocalMutation() {
  lastLocalMutationTime = Date.now();
}

export function isRecentLocalMutation(thresholdMs = 2500): boolean {
  return Date.now() - lastLocalMutationTime < thresholdMs;
}

export function debounceRealtimeSync(key: string, callback: () => void, windowMs = 1500): boolean {
  const now = Date.now();
  const lastSync = lastRealtimeSyncMap.get(key) || 0;
  if (now - lastSync < windowMs) {
    return false;
  }
  lastRealtimeSyncMap.get(key);
  lastRealtimeSyncMap.set(key, now);
  callback();
  return true;
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      markLocalMutation();
      return routeApi.createRoute(data);
    },
    onSuccess: (data: any) => {
      markLocalMutation();
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      if (data?.id) {
        queryClient.setQueryData(["route-detail", data.id], data);
      }
      toast.success("Rota salva com sucesso!");
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
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      markLocalMutation();
      return routeApi.updateRoute(id, data);
    },
    onSuccess: (data, variables) => {
      markLocalMutation();
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      if (data) {
        queryClient.setQueryData(["route-detail", variables.id], data);
      } else {
        queryClient.invalidateQueries({ queryKey: ["route-detail", variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["passageiro-ausencias"] });
      queryClient.invalidateQueries({ queryKey: ["route-ausencias"] });
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
    mutationFn: (id: string) => {
      markLocalMutation();
      return routeApi.deleteRoute(id);
    },
    onSuccess: () => {
      markLocalMutation();
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
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
    mutationFn: (id: string) => {
      markLocalMutation();
      return routeApi.iniciarRota(id);
    },
    onSuccess: (data) => {
      markLocalMutation();
      queryClient.setQueryData(["route-execution", data.id], data);
      queryClient.resetQueries({ queryKey: ["execucoes-list"] });
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
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
    mutationFn: async ({
      execucaoId,
      paradaId,
      status
    }: {
      execucaoId: string;
      paradaId: string;
      status: RouteStopStatus;
    }) => {
      markLocalMutation();
      const STOP_TIMEOUT = 12000;
      try {
        return await routeApi.atualizarParadaStatus(execucaoId, paradaId, status, { timeout: STOP_TIMEOUT });
      } catch (err: any) {
        const isNetworkOrTimeout = err.code === 'ECONNABORTED' || !err.response || err.message?.includes('timeout');
        if (isNetworkOrTimeout) {
          try {
            return await routeApi.atualizarParadaStatus(execucaoId, paradaId, status, { timeout: STOP_TIMEOUT });
          } catch (retryErr: any) {
            return await routeApi.atualizarParadaStatus(execucaoId, paradaId, status, { timeout: STOP_TIMEOUT });
          }
        }
        throw err;
      }
    },
    onSuccess: (data, variables) => {
      markLocalMutation();
      if (data) {
        queryClient.setQueryData(["route-execution", variables.execucaoId], data);
      } else {
        queryClient.invalidateQueries({ queryKey: ["route-execution", variables.execucaoId] });
      }
      if (variables.status === RouteStopStatus.AUSENTE) {
        const rotaId = (data as any)?.rota_id || (data as any)?.rota?.id;
        if (rotaId) {
          queryClient.invalidateQueries({ queryKey: ["route-detail", rotaId] });
        } else {
          queryClient.invalidateQueries({ queryKey: ["route-detail"] });
        }
      }
    },
    onError: (error: any) => {
      const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
      const description = isTimeout
        ? "A conexão de internet oscilou. Por favor, toque novamente para confirmar."
        : getErrorMessage(error, "Verifique sua conexão de internet e tente novamente.");
      toast.error("Erro ao atualizar status da parada", { description });
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
    }) => {
      markLocalMutation();
      return routeApi.reordenarExecucao(execucaoId, paradas);
    },
    onMutate: async (variables) => {
      markLocalMutation();
      await queryClient.cancelQueries({ queryKey: ["route-execution", variables.execucaoId] });

      const previousExec = queryClient.getQueryData(["route-execution", variables.execucaoId]);

      if (previousExec && typeof previousExec === "object" && "execucoes_rota_passageiros" in (previousExec as Record<string, unknown>)) {
        const casted = previousExec as { execucoes_rota_passageiros?: Array<{ id: string; ordem: number }> };
        if (Array.isArray(casted.execucoes_rota_passageiros)) {
          const ordemMap = new Map(variables.paradas.map((p) => [p.id, p.ordem]));
          const updatedParadas = casted.execucoes_rota_passageiros
            .map((p) => {
              const novaOrdem = ordemMap.get(p.id);
              return novaOrdem !== undefined ? { ...p, ordem: novaOrdem } : p;
            })
            .sort((a, b) => a.ordem - b.ordem);

          queryClient.setQueryData(["route-execution", variables.execucaoId], {
            ...casted,
            execucoes_rota_passageiros: updatedParadas,
          });
        }
      }

      return { previousExec };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousExec) {
        queryClient.setQueryData(["route-execution", variables.execucaoId], context.previousExec);
      }
      toast.error("Erro ao reordenar itinerário", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
    onSettled: (data, error, variables) => {
      markLocalMutation();
      queryClient.invalidateQueries({ queryKey: ["route-execution", variables.execucaoId] });
    },
  });
}

export function useCancelarExecucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      markLocalMutation();
      return routeApi.cancelarExecucao(id);
    },
    onSuccess: (data) => {
      markLocalMutation();
      queryClient.removeQueries({ queryKey: ["route-execution", data.id] });
      queryClient.resetQueries({ queryKey: ["execucoes-list"] });
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      const rotaId = (data as any)?.rota_id || (data as any)?.rota?.id;
      if (rotaId) {
        queryClient.invalidateQueries({ queryKey: ["route-detail", rotaId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["route-detail"] });
      }
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
    mutationFn: (id: string) => {
      markLocalMutation();
      return routeApi.finalizarExecucao(id);
    },
    onSuccess: (data) => {
      markLocalMutation();
      queryClient.removeQueries({ queryKey: ["route-execution", data.id] });
      queryClient.resetQueries({ queryKey: ["execucoes-list"] });
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      const rotaId = (data as any)?.rota_id || (data as any)?.rota?.id;
      if (rotaId) {
        queryClient.invalidateQueries({ queryKey: ["route-detail", rotaId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["route-detail"] });
      }
    },
    onError: (error: any) => {
      toast.error("Erro ao finalizar rota", {
        description: getErrorMessage(error, "Por favor, tente novamente."),
      });
    },
  });
}

export function useRegistrarAusenciaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { passageiro_id: string; rota_id: string; data_ausencia: string }) => {
      markLocalMutation();
      return routeApi.createAusencia(data);
    },
    onSuccess: (_, variables) => {
      markLocalMutation();
      if (variables.rota_id) {
        queryClient.invalidateQueries({ queryKey: ["route-detail", variables.rota_id] });
        queryClient.invalidateQueries({ queryKey: ["route-ausencias", variables.rota_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["route-detail"] });
      }
      if (variables.passageiro_id) {
        queryClient.invalidateQueries({ queryKey: ["passageiro-ausencias", variables.passageiro_id] });
      }
      queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      queryClient.invalidateQueries({ queryKey: ["route-execution"] });
    },
  });
}

export function useRemoverAusenciaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, passageiro_id, rota_id, data_ausencia }: { id: string; passageiro_id?: string; rota_id?: string; data_ausencia?: string }) => {
      markLocalMutation();
      return routeApi.deleteAusencia(id, { passageiro_id, rota_id, data_ausencia });
    },
    onSuccess: (_, variables) => {
      markLocalMutation();
      if (variables.rota_id) {
        queryClient.invalidateQueries({ queryKey: ["route-detail", variables.rota_id] });
        queryClient.invalidateQueries({ queryKey: ["route-ausencias", variables.rota_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["route-detail"] });
      }
      if (variables.passageiro_id) {
        queryClient.invalidateQueries({ queryKey: ["passageiro-ausencias", variables.passageiro_id] });
      }
      queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
      queryClient.invalidateQueries({ queryKey: ["routes-list"] });
      queryClient.invalidateQueries({ queryKey: ["route-execution"] });
    },
  });
}
