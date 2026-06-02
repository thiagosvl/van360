import { useQuery } from "@tanstack/react-query";
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
    refetchInterval: (query) => {
      // Se a rota está ativa/iniciada, podemos fazer refetch periódico suave (ex: a cada 15 segundos)
      const data = query.state.data as any;
      return data?.status === RouteExecutionStatus.INICIADA ? 15000 : false;
    }
  });
}
