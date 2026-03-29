import { apiClient } from "./client";
import { Contrato, CreateContratoDTO } from "@/types/contract";

export const contratoApi = {
  listContratos: async (params?: Record<string, any>) => {
    const { data } = await apiClient.get<{ data: any[]; pagination: any }>('/contratos', { params });
    return data;
  },

  getKPIs: async () => {
    const { data } = await apiClient.get<{ pendentes: number; assinados: number; semContrato: number }>('/contratos/kpis');
    return data;
  },

  createContrato: async (dto: CreateContratoDTO) => {
    const { data } = await apiClient.post<Contrato>('/contratos', dto);
    return data;
  },

  deleteContrato: async (contratoId: string) => {
    const { data } = await apiClient.delete(`/contratos/${contratoId}`);
    return data;
  },

  substituirContrato: async (contratoId: string) => {
    const { data } = await apiClient.post(`/contratos/${contratoId}/substituir`);
    return data;
  },

  reenviarContrato: async (contratoId: string) => {
    const { data } = await apiClient.post(`/contratos/${contratoId}/reenviar`);
    return data;
  },

  previewContrato: async (draftConfig?: any) => {
    const { data } = await apiClient.post('/contratos/preview', draftConfig || {}, {
      responseType: 'blob',
    });
    return data;
  }
};
