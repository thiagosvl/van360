import { apiClient } from "../client";

export interface AdminEvolutionInstanceItem {
  id: string;
  instance_name: string;
  description: string | null;
  purpose: "TRANSACTIONAL" | "BULK";
  rate_limit_max: number;
  rate_limit_duration: number;
  is_active: boolean;
  is_default_for_purpose: boolean;
  evolution_status?: string;
  evolution_status_reason?: string;
  created_at: string;
  updated_at: string;
}

const BASE = "/admin";

export const adminEvolutionApi = {
  getEvolutionInstances: () =>
    apiClient.get<AdminEvolutionInstanceItem[]>(`${BASE}/evolution-instances`).then(r => r.data),
};
