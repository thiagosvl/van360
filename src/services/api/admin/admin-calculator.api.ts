import { apiClient } from "../client";

export interface CalculatorBaselineDTO {
  motoristas: {
    total: number;
    ativos: number;
    pagantes: number;
    mensal: number;
    anual: number;
    vitalicio: number;
    trial: number;
  };
  receita: {
    mrrReal: number;
    arrReal: number;
    mensalReal: number;
    anualRealDiluido: number;
    anualTotalContratado?: number;
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
    taxaAtrasoD3Pct?: number;
  };
  gateway: {
    pctPix: number;
    pctCartao: number;
    taxaPix: number;
    taxaCartao: number;
    impostoSimples: number;
  };
  cobrancaAutomatica?: {
    totalPagasMes: number;
    spreadUnitario: number;
    receitaEstimadaSpread: number;
  };
}

const BASE = "/admin";

export const adminCalculatorApi = {
  getBaseline: () =>
    apiClient.get<CalculatorBaselineDTO>(`${BASE}/calculator/baseline`).then(r => r.data),
};
