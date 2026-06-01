import { Route, RouteExecution } from "@/types/route";
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

  listExecucoes: (usuarioId: string): Promise<RouteExecution[]> =>
    apiClient
      .get(`${endpointBase}/execucoes/usuario/${usuarioId}`)
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
    passageiroId: string,
    status: "embarcado" | "ausente"
  ): Promise<RouteExecution> =>
    apiClient
      .post(`${endpointBase}/execucoes/${execucaoId}/parada`, {
        passageiro_id: passageiroId,
        status
      })
      .then(res => res.data),

  cancelarExecucao: (id: string): Promise<RouteExecution> =>
    apiClient
      .post(`${endpointBase}/execucoes/${id}/cancelar`)
      .then(res => res.data),
};
