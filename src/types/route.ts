import { Passageiro, PassageiroResponsavel } from "./passageiro";

export enum RouteExecutionStatus {
  INICIADA = "iniciada",
  CONCLUIDA = "concluida",
  CANCELADA = "cancelada"
}

export enum RouteStopStatus {
  PENDENTE = "pendente",
  EMBARCADO = "embarcado",
  AUSENTE = "ausente"
}

export enum RouteNodeType {
  PASSAGEIRO = "passageiro",
  ESCOLA = "escola"
}

export enum RouteSentido {
  INDO = "indo",
  VOLTANDO = "voltando"
}

export const ROUTE_SENTIDO_LABELS: Record<RouteSentido, string> = {
  [RouteSentido.INDO]: "Indo",
  [RouteSentido.VOLTANDO]: "Voltando"
};

export interface RoutePassenger {
  id?: string;
  rota_id?: string;
  tipo_no: RouteNodeType;
  passageiro_id?: string | null;
  escola_id?: string | null;
  ordem: number;
  sentido?: RouteSentido | null;
  passageiro?: Passageiro;
  escola?: {
    id: string;
    nome: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
  };
}

export interface Route {
  id: string;
  usuario_id: string;
  nome: string;
  veiculo_id?: string | null;
  numero_passageiros?: number;
  veiculo: {
    id: string;
    marca: string;
    modelo: string;
    placa: string;
  };
  passageiros?: RoutePassenger[];
  created_at: string;
  updated_at: string;
}

export interface RouteExecutionPassenger {
  id: string;
  execucao_rota_id: string;
  tipo_no: RouteNodeType;
  passageiro_id?: string | null;
  escola_id?: string | null;
  status: RouteStopStatus;
  ordem: number;
  sentido?: RouteSentido | null;
  notificado_em?: string;
  visitado_em?: string;
  passageiro?: Passageiro;
  escola?: {
    id: string;
    nome: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
  };
}

export interface RouteExecution {
  id: string;
  rota_id: string;
  usuario_id: string;
  status: RouteExecutionStatus;
  iniciada_em: string;
  finalizada_em?: string;
  created_at: string;
  alertaInativos?: string | null;
  paradas?: RouteExecutionPassenger[];
  rota?: {
    id: string;
    nome: string;
  };
}
