import { apiClient } from "./client";
import {
  CheckPhoneResponse,
  ResponsavelCarteirinhaData,
  ResponsavelLoginResponse,
  RegistrarAusenciaPayload
} from "@/types/responsavel";

export const responsavelApi = {
  checkPhone: async (telefone: string): Promise<CheckPhoneResponse> => {
    const { data } = await apiClient.post<CheckPhoneResponse>("/public/portal-responsavel/check-phone", {
      telefone
    });
    return data;
  },

  setupPin: async (telefone: string, pin: string): Promise<ResponsavelLoginResponse> => {
    const { data } = await apiClient.post<ResponsavelLoginResponse>("/public/portal-responsavel/setup-pin", {
      telefone,
      pin
    });
    return data;
  },

  login: async (telefone: string, pin: string): Promise<ResponsavelLoginResponse> => {
    const { data } = await apiClient.post<ResponsavelLoginResponse>("/public/portal-responsavel/login", {
      telefone,
      pin
    });
    return data;
  },

  getCarteirinha: async (passageiroId: string, token: string): Promise<ResponsavelCarteirinhaData> => {
    const { data } = await apiClient.get<ResponsavelCarteirinhaData>(
      `/public/portal-responsavel/passageiro/${passageiroId}`,
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
      "/public/portal-responsavel/passageiros",
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
      `/public/portal-responsavel/passageiro/${passageiroId}/dados-complementares`,
      { cpf, email },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  updateObservacoes: async (
    passageiroId: string,
    token: string,
    observacoes: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.put<{ success: boolean }>(
      `/public/portal-responsavel/passageiro/${passageiroId}/observacoes`,
      { observacoes },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  checkResetEmails: async (telefone: string): Promise<{ emails: { id: number; mascarado: string }[] }> => {
    const { data } = await apiClient.post<{ emails: { id: number; mascarado: string }[] }>("/public/portal-responsavel/forgot-pin/check-emails", {
      telefone
    });
    return data;
  },

  sendResetOtp: async (telefone: string, emailIndex: number = 0): Promise<{ emailMascarado: string }> => {
    const { data } = await apiClient.post<{ emailMascarado: string }>("/public/portal-responsavel/forgot-pin/send-otp", {
      telefone,
      emailIndex
    });
    return data;
  },

  validateResetOtp: async (telefone: string, codigo: string): Promise<{ resetToken: string }> => {
    const { data } = await apiClient.post<{ resetToken: string }>("/public/portal-responsavel/forgot-pin/validate-otp", {
      telefone,
      codigo
    });
    return data;
  },

  executePinReset: async (resetToken: string, newPin: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean }>("/public/portal-responsavel/forgot-pin/execute-reset", {
      resetToken,
      newPin
    });
    return data;
  },

  resetPinByDriver: async (passageiroId: string, responsavelId?: string): Promise<{ success: boolean }> => {
    const params = responsavelId ? `?responsavelId=${responsavelId}` : "";
    const { data } = await apiClient.post<{ success: boolean }>(`/passageiros/${passageiroId}/reset-pin${params}`);
    return data;
  },

  registrarAusencia: async (
    passageiroId: string,
    payload: RegistrarAusenciaPayload,
    token: string
  ): Promise<any> => {
    const { data } = await apiClient.post<any>(
      `/public/portal-responsavel/passageiro/${passageiroId}/ausencias`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  removerAusencia: async (
    passageiroId: string,
    ausenciaId: string,
    token: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/public/portal-responsavel/passageiro/${passageiroId}/ausencias/${ausenciaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  addResponsavel: async (
    passageiroId: string,
    payload: Record<string, unknown>,
    token: string
  ): Promise<any> => {
    const { data } = await apiClient.post<any>(
      `/public/portal-responsavel/passageiro/${passageiroId}/responsaveis`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  updateResponsavel: async (
    passageiroId: string,
    responsavelId: string,
    payload: Record<string, unknown>,
    token: string
  ): Promise<any> => {
    const { data } = await apiClient.put<any>(
      `/public/portal-responsavel/passageiro/${passageiroId}/responsaveis/${responsavelId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  deleteResponsavel: async (
    passageiroId: string,
    responsavelId: string,
    token: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/public/portal-responsavel/passageiro/${passageiroId}/responsaveis/${responsavelId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  setPrincipalResponsavel: async (
    passageiroId: string,
    responsavelId: string,
    token: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.patch<{ success: boolean }>(
      `/public/portal-responsavel/passageiro/${passageiroId}/responsaveis/${responsavelId}/set-principal`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  },

  registerPushToken: async (
    payload: { token: string; platform: string },
    authToken: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean }>(
      "/public/portal-responsavel/push-token",
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return data;
  },

  getRastreamento: async (passageiroId: string, token: string) => {
    const { data } = await apiClient.get<import("@/types/tracking").TrackingResponse>(
      `/public/portal-responsavel/passageiro/${passageiroId}/rastreamento`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  }
};
