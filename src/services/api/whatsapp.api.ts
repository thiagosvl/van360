import { apiClient } from "./client";

export interface WhatsappStatus {
  instanceName: string;
  state: "open" | "close" | "connecting" | "UNKNOWN" | "NOT_FOUND" | "ERROR" | "PAIRED"; 
  statusReason?: number;
}

export interface WhatsappConnectResponse {
  qrcode?: {
    base64: string;
    code?: string;
  };
  instance?: {
    state: string;
  };
  pairingCode?: string;
}

export const whatsappApi = {
  getStatus: async (): Promise<WhatsappStatus> => {
    const { data } = await apiClient.get<WhatsappStatus>("/whatsapp/status");
    return data;
  },

  connect: async (): Promise<WhatsappConnectResponse> => {
    const { data } = await apiClient.post<WhatsappConnectResponse>("/whatsapp/connect");
    return data;
  },

  disconnect: async (): Promise<void> => {
    await apiClient.post("/whatsapp/disconnect");
  },

  requestPairingCode: async (): Promise<WhatsappConnectResponse> => {
    const { data } = await apiClient.post<WhatsappConnectResponse>("/whatsapp/pairing-code");
    return data;
  }
};
