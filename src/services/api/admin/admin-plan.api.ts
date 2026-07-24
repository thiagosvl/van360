import { apiClient } from "../client";

export interface AdminSaaSPlanItem {
  id: string;
  nome: string;
  identificador: string;
  valor: number;
  valor_promocional: number | null;
  ativo: boolean;
}

export interface UpdatePlanPayload {
  valor?: number;
  valor_promocional?: number | null;
}

const BASE = "/admin";

export const adminPlanApi = {
  getPlans: () =>
    apiClient.get<AdminSaaSPlanItem[]>(`${BASE}/plans`).then(r => r.data),

  updatePlan: (id: string, data: UpdatePlanPayload) =>
    apiClient.patch(`${BASE}/plans/${id}`, data).then(r => r.data),
};
