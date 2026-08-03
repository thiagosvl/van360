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
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePassageiroAusencias(passageiroId: string) {
  return useQuery({
    queryKey: ["passageiro-ausencias", passageiroId],
    queryFn: () => routeApi.listAusenciasByPassageiro(passageiroId),
    enabled: !!passageiroId,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePassageiroRotas(passageiroId: string) {
  return useQuery({
    queryKey: ["passageiro-rotas", passageiroId],
    queryFn: () => routeApi.listRotasByPassageiro(passageiroId),
    enabled: !!passageiroId,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useRegistrarAusenciaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { passageiro_id: string; rota_id: string; data_ausencia: string }) =>
      routeApi.createAusencia(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["route-ausencias"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["passageiro-ausencias"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["passageiro-rotas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["routes"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["route-execution"], refetchType: "all" });
    },
  });
}

export function useRemoverAusenciaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, passageiro_id, rota_id, data_ausencia }: { id: string; passageiro_id?: string; rota_id?: string; data_ausencia?: string }) =>
      routeApi.deleteAusencia(id, { passageiro_id, rota_id, data_ausencia }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["route-ausencias"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["passageiro-ausencias"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["passageiro-rotas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["routes"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["route-execution"], refetchType: "all" });
    },
  });
}
