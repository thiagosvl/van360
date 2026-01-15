import { apiClient } from "./client";

export interface WhatsappStatus {
  instanceName: string;
  state: "open" | "close" | "connecting" | "UNKNOWN" | "NOT_FOUND" | "ERROR" | "PAIRED"; 
  statusReason?: number;
  pairing_code?: string;
  pairing_code_expires_at?: string;
  telefone?: string;
}

export interface WhatsappConnectResponse {
  qrcode?: {
    base64: string;
    code?: string;
  };
  instance?: {
    state: string;
  };
  pairingCode?: {
    code: string;
  };
}

export const whatsappApi = {
  getStatus: async (): Promise<WhatsappStatus> => {
    try {
      const { data } = await apiClient.get<WhatsappStatus>("/whatsapp/status");
      return data;
    } catch (error: any) {
      // Se a requisição foi cancelada, não lançar erro
      if (error?.code === 'ECONNABORTED' || error?.message === 'Request aborted') {
        throw new Error("Requisição cancelada. Tentando novamente...");
      }
      throw error;
    }
  },

  connect: async (): Promise<WhatsappConnectResponse> => {
    try {
      const { data } = await apiClient.post<WhatsappConnectResponse>("/whatsapp/connect");
      return data;
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED' || error?.message === 'Request aborted') {
        throw new Error("Requisição cancelada. Tentando novamente...");
      }
      throw error;
    }
  },

  disconnect: async (): Promise<void> => {
    try {
      await apiClient.post("/whatsapp/disconnect");
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED' || error?.message === 'Request aborted') {
        throw new Error("Requisição cancelada. Tentando novamente...");
      }
      throw error;
    }
  },

  requestPairingCode: async (): Promise<WhatsappConnectResponse> => {
    try {
      const { data } = await apiClient.post<WhatsappConnectResponse>("/whatsapp/pairing-code");
      return data;
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED' || error?.message === 'Request aborted') {
        throw new Error("Requisição cancelada. Tentando novamente...");
      }
      throw error;
    }
  }
};
