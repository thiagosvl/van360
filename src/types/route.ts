import { Passageiro } from "./passageiro";

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
  status: "iniciada" | "concluida" | "cancelada";
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
  status: "pendente" | "a_caminho" | "embarcado" | "ausente";
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
  escola?: {
    id: string;
    nome: string;
  };
}
