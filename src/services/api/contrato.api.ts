import { apiClient } from "./client";
import { Contrato, CreateContratoDTO, ImportContratoDTO, ListContratosResponse } from "@/types/contract";
import { PreviewConfig } from "@/hooks/api/useContratos";

export const contratoApi = {
  listContratos: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<ListContratosResponse>('/contratos', { params });
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

  importarContrato: async (dto: ImportContratoDTO) => {
    const { data } = await apiClient.post<Contrato>('/contratos/importar', dto);
    return data;
  },

  deleteContrato: async (contratoId: string) => {
    const { data } = await apiClient.delete(`/contratos/${contratoId}`);
    return data;
  },

  substituirContrato: async (contratoId: string, options?: { notificarResponsavel?: boolean }) => {
    const { data } = await apiClient.post(`/contratos/${contratoId}/substituir`, options || {});
    return data;
  },

  previewContrato: async (draftConfig?: PreviewConfig) => {
    const { data } = await apiClient.post('/contratos/preview', draftConfig || {}, {
      responseType: 'blob',
    });
    return data;
  },

  downloadContrato: async (contratoId: string) => {
    const { data } = await apiClient.get(`/contratos/${contratoId}/download`, {
      responseType: 'blob',
    });
    return data as Blob;
  }
};
