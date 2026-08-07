import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { RouteExecutionStatus } from "@/types/route";

export function useRoutes(usuarioId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["routes-list", usuarioId],
    queryFn: () => routeApi.listRoutes(usuarioId),
    enabled: options?.enabled !== undefined ? options.enabled : !!usuarioId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
}

export function useRouteDetail(id: string) {
  return useQuery({
    queryKey: ["route-detail", id],
    queryFn: () => routeApi.getRoute(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useExecucoesRota(usuarioId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["execucoes-list", usuarioId],
    queryFn: () => routeApi.listExecucoes(usuarioId),
    enabled: options?.enabled !== undefined ? options.enabled : !!usuarioId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
}

export function useExecucaoDetail(id: string) {
  return useQuery({
    queryKey: ["route-execution", id],
    queryFn: () => routeApi.getExecucao(id),
    enabled: !!id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });
}

export function useAusenciasRota(rotaId: string, dataAusencia?: string) {
  return useQuery({
    queryKey: ["route-ausencias", rotaId, dataAusencia],
    queryFn: () => routeApi.listAusencias(rotaId, dataAusencia),
    enabled: !!rotaId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function usePassageiroAusencias(passageiroId: string) {
  return useQuery({
    queryKey: ["passageiro-ausencias", passageiroId],
    queryFn: () => routeApi.listAusenciasByPassageiro(passageiroId),
    enabled: !!passageiroId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function usePassageiroRotas(passageiroId: string) {
  return useQuery({
    queryKey: ["passageiro-rotas", passageiroId],
    queryFn: () => routeApi.listRotasByPassageiro(passageiroId),
    enabled: !!passageiroId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export { useRegistrarAusenciaMutation, useRemoverAusenciaMutation } from "./useRouteMutations";
