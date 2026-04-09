import { apiClient } from "./client";
import { PlansResponse } from "@/types/subscription";

/**
 * Public API — Endpoints acessíveis sem autenticação
 */
export const publicApi = {
  /**
   * Lista os planos SaaS e configurações de promoção para a Landing Page
   */
  getPlans: (): Promise<PlansResponse> =>
    apiClient.get(`/public/subscriptions/plans`).then((res) => res.data),
    
  /**
   * Valida se um motorista existe (usado em links de indicação/validação pública)
   */
  validateMotorista: (id: string) =>
    apiClient.get(`/public/motoristas/${id}/validate`).then((res) => res.data),
};
