import { apiClient } from "../client";
import {
  AdminRepassesListResponse,
  AdminRepasseKpis,
  RepasseFiltersState,
  MotoristaConfiguracaoFinanceira,
} from "@/types/admin-repasse";

const BASE = "/admin";

export interface ListAdminRepassesParams {
  page?: number;
  limit?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  motorista_id?: string;
  search?: string;
}

export const adminRepasseApi = {
  listRepasses: (params?: ListAdminRepassesParams) =>
    apiClient.get<AdminRepassesListResponse>(`${BASE}/repasses`, { params }).then((r) => r.data),

  getStats: (params?: { data_inicio?: string; data_fim?: string; motorista_id?: string }) =>
    apiClient.get<AdminRepasseKpis>(`${BASE}/repasses/stats`, { params }).then((r) => r.data),

  retryRepasse: (id: string) =>
    apiClient.post<{ success: boolean; message: string }>(`${BASE}/repasses/${id}/retry`).then((r) => r.data),

  getMotoristaConfiguracaoFinanceira: (userId: string) =>
    apiClient.get<MotoristaConfiguracaoFinanceira>(`${BASE}/users/${userId}/configuracoes-financeiras`).then((r) => r.data),

  updateMotoristaConfiguracaoFinanceira: (userId: string, data: Partial<MotoristaConfiguracaoFinanceira>) =>
    apiClient.patch<MotoristaConfiguracaoFinanceira>(`${BASE}/users/${userId}/configuracoes-financeiras`, data).then((r) => r.data),
};
