import { Passageiro } from "./passageiro";

export enum RouteExecutionStatus {
  INICIADA = "iniciada",
  CONCLUIDA = "concluida",
  CANCELADA = "cancelada"
}

export enum RouteStopStatus {
  PENDENTE = "pendente",
  A_CAMINHO = "a_caminho",
  EMBARCADO = "embarcado",
  AUSENTE = "ausente"
}

export interface Route {
  id: string;
  usuario_id: string;
  nome: string;
  periodo: string; // 'manha', 'tarde', 'noite'
  tipo: "ida" | "volta";
  numero_passageiros?: number;
  passageiros?: RoutePassenger[];
  created_at: string;
  updated_at: string;
}

export interface RoutePassenger {
  id: string;
  rota_id: string;
  passageiro_id: string;
  ordem: number;
  nome: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  ativo: boolean;
  escola?: {
    id: string;
    nome: string;
  };
}

export interface RouteExecution {
  id: string;
  rota_id: string;
  usuario_id: string;
  status: RouteExecutionStatus;
  tipo: "ida" | "volta";
  iniciada_em: string;
  finalizada_em?: string;
  created_at: string;
  paradas?: RouteExecutionPassenger[];
  rota?: {
    id: string;
    nome: string;
  };
}

export interface RouteExecutionPassenger {
  id: string;
  execucao_rota_id: string;
  passageiro_id: string;
  status: RouteStopStatus;
  ordem: number;
  notificado_em?: string;
  visitado_em?: string;
  nome: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  latitude?: number;
  longitude?: number;
  escola?: {
    id: string;
    nome: string;
  };
}
