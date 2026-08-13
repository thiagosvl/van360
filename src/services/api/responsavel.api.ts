import { apiClient } from "./client";
import {
  CheckPhoneResponse,
  ResponsavelCarteirinhaData,
  ResponsavelLoginResponse
} from "@/types/responsavel";

export const responsavelApi = {
  checkPhone: async (telefone: string): Promise<CheckPhoneResponse> => {
    const { data } = await apiClient.post<CheckPhoneResponse>("/public/responsavel/check-phone", {
      telefone
    });
    return data;
  },

  setupPin: async (telefone: string, pin: string): Promise<ResponsavelLoginResponse> => {
    const { data } = await apiClient.post<ResponsavelLoginResponse>("/public/responsavel/setup-pin", {
      telefone,
      pin
    });
    return data;
  },

  login: async (telefone: string, pin: string): Promise<ResponsavelLoginResponse> => {
    const { data } = await apiClient.post<ResponsavelLoginResponse>("/public/responsavel/login", {
      telefone,
      pin
    });
    return data;
  },

  getCarteirinha: async (passageiroId: string, token: string): Promise<ResponsavelCarteirinhaData> => {
    const { data } = await apiClient.get<ResponsavelCarteirinhaData>(
      `/public/responsavel/passageiro/${passageiroId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  getPassageiros: async (token: string): Promise<ResponsavelLoginResponse["passageiros"]> => {
    const { data } = await apiClient.get<ResponsavelLoginResponse["passageiros"]>(
      "/public/responsavel/passageiros",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  updateDadosComplementares: async (
    passageiroId: string,
    token: string,
    cpf: string,
    email: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.put<{ success: boolean }>(
      `/public/responsavel/passageiro/${passageiroId}/dados-complementares`,
      { cpf, email },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  checkResetEmails: async (telefone: string): Promise<{ emails: { id: number; mascarado: string }[] }> => {
    const { data } = await apiClient.post<{ emails: { id: number; mascarado: string }[] }>("/public/responsavel/forgot-pin/check-emails", {
      telefone
    });
    return data;
  },

  sendResetOtp: async (telefone: string, emailIndex: number = 0): Promise<{ emailMascarado: string }> => {
    const { data } = await apiClient.post<{ emailMascarado: string }>("/public/responsavel/forgot-pin/send-otp", {
      telefone,
      emailIndex
    });
    return data;
  },

  validateResetOtp: async (telefone: string, codigo: string): Promise<{ resetToken: string }> => {
    const { data } = await apiClient.post<{ resetToken: string }>("/public/responsavel/forgot-pin/validate-otp", {
      telefone,
      codigo
    });
    return data;
  },

  executePinReset: async (resetToken: string, newPin: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean }>("/public/responsavel/forgot-pin/execute-reset", {
      resetToken,
      newPin
    });
    return data;
  },

  resetPinByDriver: async (passageiroId: string, responsavelId?: string): Promise<{ success: boolean }> => {
    const params = responsavelId ? `?responsavelId=${responsavelId}` : "";
    const { data } = await apiClient.post<{ success: boolean }>(`/passageiros/${passageiroId}/reset-pin${params}`);
    return data;
  }
};
