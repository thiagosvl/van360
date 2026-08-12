import { Route, RouteExecution, RouteStopStatus } from "@/types/route";
import { apiClient } from "./client";

const endpointBase = "/routes";

export const routeApi = {
  listRoutes: (usuarioId: string): Promise<Route[]> =>
    apiClient
      .get(`${endpointBase}/usuario/${usuarioId}`)
      .then(res => res.data),

  getRoute: (id: string): Promise<Route> =>
    apiClient
      .get(`${endpointBase}/${id}`)
      .then(res => res.data),

  createRoute: (data: any): Promise<Route> =>
    apiClient
      .post(`${endpointBase}`, data)
      .then(res => res.data),

  updateRoute: (id: string, data: any): Promise<Route> =>
    apiClient
      .put(`${endpointBase}/${id}`, data)
      .then(res => res.data),

  deleteRoute: (id: string): Promise<void> =>
    apiClient
      .delete(`${endpointBase}/${id}`)
      .then(res => res.data),

  listExecucoes: (usuarioId: string, params?: { limit?: number; page?: number }): Promise<RouteExecution[]> =>
    apiClient
      .get(`${endpointBase}/execucoes/usuario/${usuarioId}`, { params })
      .then(res => res.data),

  getExecucaoAtivaVeiculo: (veiculoId: string): Promise<RouteExecution | null> =>
    apiClient
      .get(`${endpointBase}/execucoes/ativa-veiculo/${veiculoId}`)
      .then(res => res.data),

  getExecucao: (id: string): Promise<RouteExecution> =>
    apiClient
      .get(`${endpointBase}/execucoes/${id}`)
      .then(res => res.data),

  iniciarRota: (id: string): Promise<RouteExecution> =>
    apiClient
      .post(`${endpointBase}/${id}/iniciar`)
      .then(res => res.data),

  atualizarParadaStatus: (
    execucaoId: string,
    paradaId: string,
    status: RouteStopStatus,
    options?: { timeout?: number }
  ): Promise<RouteExecution> =>
    apiClient
      .post(
        `${endpointBase}/execucoes/${execucaoId}/parada`,
        {
          parada_id: paradaId,
          status
        },
        options?.timeout ? { timeout: options.timeout } : undefined
      )
      .then(res => res.data),

  reordenarExecucao: (
    execucaoId: string,
    paradas: Array<{ id: string; ordem: number }>
  ): Promise<RouteExecution> =>
    apiClient
      .post(`${endpointBase}/execucoes/${execucaoId}/reordenar`, { paradas })
      .then(res => res.data),

  cancelarExecucao: (id: string): Promise<RouteExecution> =>
    apiClient
      .post(`${endpointBase}/execucoes/${id}/cancelar`)
      .then(res => res.data),

  finalizarExecucao: (id: string): Promise<RouteExecution> =>
    apiClient
      .post(`${endpointBase}/execucoes/${id}/finalizar`)
      .then(res => res.data),

  createAusencia: (data: { passageiro_id: string; rota_id: string; data_ausencia: string }): Promise<any> =>
    apiClient
      .post(`${endpointBase}/ausencias`, data)
      .then(res => res.data),

  deleteAusencia: (id: string, params?: { passageiro_id?: string; rota_id?: string; data_ausencia?: string }): Promise<void> =>
    apiClient
      .delete(`${endpointBase}/ausencias/${id}`, { params })
      .then(res => res.data),

  listAusencias: (rotaId: string, dataAusencia?: string): Promise<any[]> =>
    apiClient
      .get(`${endpointBase}/${rotaId}/ausencias`, { params: { data: dataAusencia } })
      .then(res => res.data),

  listAusenciasByPassageiro: (passageiroId: string): Promise<any[]> =>
    apiClient
      .get(`${endpointBase}/passageiros/${passageiroId}/ausencias`)
      .then(res => res.data),

  listRotasByPassageiro: (passageiroId: string): Promise<any[]> =>
    apiClient
      .get(`${endpointBase}/passageiros/${passageiroId}/rotas`)
      .then(res => res.data),
};
