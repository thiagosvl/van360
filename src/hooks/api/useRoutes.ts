import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { RouteExecutionStatus } from "@/types/route";

export function useRoutes(usuarioId: string) {
  return useQuery({
    queryKey: ["routes", usuarioId],
    queryFn: () => routeApi.listRoutes(usuarioId),
    enabled: !!usuarioId,
  });
}

export function useRouteDetail(id: string) {
  return useQuery({
    queryKey: ["route", id],
    queryFn: () => routeApi.getRoute(id),
    enabled: !!id,
  });
}

export function useExecucoesRota(usuarioId: string) {
  return useQuery({
    queryKey: ["routes", "execucoes", usuarioId],
    queryFn: () => routeApi.listExecucoes(usuarioId),
    enabled: !!usuarioId,
  });
}

export function useExecucaoDetail(id: string) {
  return useQuery({
    queryKey: ["route-execution", id],
    queryFn: () => routeApi.getExecucao(id),
    enabled: !!id,
    refetchInterval: false
  });
}

export function useAusenciasRota(rotaId: string, dataAusencia?: string) {
  return useQuery({
    queryKey: ["route-ausencias", rotaId, dataAusencia],
    queryFn: () => routeApi.listAusencias(rotaId, dataAusencia),
    enabled: !!rotaId,
  });
}

export function useRegistrarAusenciaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { passageiro_id: string; rota_id: string; data_ausencia: string }) =>
      routeApi.createAusencia(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route", variables.rota_id] });
      queryClient.invalidateQueries({ queryKey: ["route-ausencias", variables.rota_id] });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}

export function useRemoverAusenciaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, passageiro_id, rota_id, data_ausencia }: { id: string; passageiro_id?: string; rota_id?: string; data_ausencia?: string }) =>
      routeApi.deleteAusencia(id, { passageiro_id, rota_id, data_ausencia }),
    onSuccess: (_, variables) => {
      if (variables.rota_id) {
        queryClient.invalidateQueries({ queryKey: ["route", variables.rota_id] });
        queryClient.invalidateQueries({ queryKey: ["route-ausencias", variables.rota_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["route"] });
        queryClient.invalidateQueries({ queryKey: ["route-ausencias"] });
      }
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route-execution"] });
    },
  });
}
