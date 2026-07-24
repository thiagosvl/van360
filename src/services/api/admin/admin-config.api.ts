import { apiClient } from "../client";

export interface AdminConfigItem {
  id: number;
  chave: string;
  valor: string;
}

const BASE = "/admin";

export const adminConfigApi = {
  getConfigs: () =>
    apiClient.get<AdminConfigItem[]>(`${BASE}/configs`).then(r => r.data),

  updateConfig: (chave: string, valor: string) =>
    apiClient.put(`${BASE}/configs`, { chave, valor }).then(r => r.data),
};
