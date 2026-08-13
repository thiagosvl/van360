import { apiClient } from "./client";
import {
  CheckPhoneResponse,
  ResponsavelCarteirinhaData,
  ResponsavelLoginResponse
} from "@/types/responsavel";

export const responsavelApi = {
  checkPhone: async (telefone: string): Promise<CheckPhoneResponse> => {
    const { data } = await apiClient.post<CheckPhoneResponse>("/api/public/responsavel/check-phone", {
      telefone
    });
    return data;
  },

  setupPin: async (telefone: string, pin: string): Promise<ResponsavelLoginResponse> => {
    const { data } = await apiClient.post<ResponsavelLoginResponse>("/api/public/responsavel/setup-pin", {
      telefone,
      pin
    });
    return data;
  },

  login: async (telefone: string, pin: string): Promise<ResponsavelLoginResponse> => {
    const { data } = await apiClient.post<ResponsavelLoginResponse>("/api/public/responsavel/login", {
      telefone,
      pin
    });
    return data;
  },

  getCarteirinha: async (passageiroId: string, token: string): Promise<ResponsavelCarteirinhaData> => {
    const { data } = await apiClient.get<ResponsavelCarteirinhaData>(
      `/api/public/responsavel/passageiro/${passageiroId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  resetPinByDriver: async (passageiroId: string, responsavelId?: string): Promise<{ success: boolean }> => {
    const params = responsavelId ? `?responsavelId=${responsavelId}` : "";
    const { data } = await apiClient.post<{ success: boolean }>(`/api/passageiros/${passageiroId}/reset-pin${params}`);
    return data;
  }
};
