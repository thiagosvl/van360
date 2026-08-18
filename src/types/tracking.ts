import { RouteExecutionStatus, RouteStopStatus, RouteSentido } from "./route";

export interface TrackingGpsPing {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
}

export interface TrackingExecucaoInfo {
  id: string;
  rota_id: string;
  rota_nome: string;
  iniciada_em: string;
  status: RouteExecutionStatus;
  parada_aluno: {
    id: string;
    ordem: number;
    status: RouteStopStatus;
    sentido: RouteSentido | null;
    notificado_em: string | null;
    visitado_em: string | null;
  };
  destino: {
    latitude: number | null;
    longitude: number | null;
    endereco: string;
    tipo: "residencia" | "escola";
  };
  escola: {
    id: string;
    nome: string;
  } | null;
  fila: {
    paradas_restantes: number;
    total_paradas: number;
    paradas_concluidas: number;
  };
}

export interface TrackingResponse {
  ativa: boolean;
  execucao: TrackingExecucaoInfo | null;
}
