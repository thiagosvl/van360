import { apiClient } from "../client";

export interface CalculatorBaselineDTO {
  motoristas: {
    total: number;
    ativos: number;
    mensal: number;
    anual: number;
    vitalicio: number;
    trial: number;
  };
  passageiros: {
    total: number;
    ativos: number;
    pagantes: number;
    notificaveis: number;
    mediaPorMotorista: number;
  };
  waba: {
    totalMensagensMes: number;
    custoEstimadoUsd: number;
    custoEstimadoBrl: number;
  };
  gateway: {
    pctPix: number;
    pctCartao: number;
    taxaPix: number;
    taxaCartao: number;
    impostoSimples: number;
  };
}

const BASE = "/admin";

export const adminCalculatorApi = {
  getBaseline: () =>
    apiClient.get<CalculatorBaselineDTO>(`${BASE}/calculator/baseline`).then(r => r.data),
};
