import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@/services/api/route.api";
import { RouteExecutionStatus } from "@/types/route";

export function useRoutes(usuarioId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["routes-list", usuarioId],
    queryFn: () => routeApi.listRoutes(usuarioId),
    enabled: options?.enabled !== undefined ? options.enabled : !!usuarioId,
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

export function useExecucoesRota(
  usuarioId: string,
  paramsOrOptions?: { limit?: number; page?: number; enabled?: boolean },
  options?: { enabled?: boolean }
) {
  const isOptionsSecondArg =
    paramsOrOptions && "enabled" in paramsOrOptions && !("limit" in paramsOrOptions) && !("page" in paramsOrOptions);

  const queryParams = isOptionsSecondArg
    ? undefined
    : (paramsOrOptions as { limit?: number; page?: number } | undefined);
  const queryOptions = isOptionsSecondArg ? (paramsOrOptions as { enabled?: boolean }) : options;

  const isEnabled = queryOptions?.enabled !== undefined ? queryOptions.enabled : !!usuarioId;

  return useQuery({
    queryKey: ["execucoes-list", usuarioId, queryParams?.limit, queryParams?.page],
    queryFn: () => routeApi.listExecucoes(usuarioId, queryParams),
    enabled: isEnabled,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useExecucaoAtivaVeiculo(veiculoId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["execucao-ativa-veiculo", veiculoId],
    queryFn: () => routeApi.getExecucaoAtivaVeiculo(veiculoId!),
    enabled: options?.enabled !== undefined ? options.enabled : !!veiculoId,
    staleTime: 1000 * 10,
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

export function useProximasAusencias(params?: { rotaId?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ["route-ausencias-futuras", params?.rotaId],
    queryFn: () => routeApi.listAusenciasFuturas({ rotaId: params?.rotaId }),
    enabled: params?.enabled !== undefined ? params.enabled : true,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useBuscarAlunos(params: { search: string; rotaId?: string; enabled?: boolean }) {
  const searchTerm = params.search.trim();
  const isEnabled = (params.enabled !== undefined ? params.enabled : true) && searchTerm.length >= 3;

  return useQuery({
    queryKey: ["route-alunos-buscar", searchTerm, params.rotaId],
    queryFn: () => routeApi.buscarAlunos({ search: searchTerm, rotaId: params.rotaId }),
    enabled: isEnabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export type { AusenciaFuturaItem, AlunoBuscaItem } from "@/services/api/route.api";
export { useRegistrarAusenciaMutation, useRemoverAusenciaMutation } from "./useRouteMutations";
