import { getMessage } from '@/constants/messages';
import { apiClient } from '@/services/api/client';
import { Contrato, CreateContratoDTO } from '@/types/contract';
import { openBrowserLink } from '@/utils/browser';
import { toast } from '@/utils/notifications/toast';
import { Capacitor } from '@capacitor/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Option interface for queries
interface UseContratosOptions {
  enabled?: boolean;
}

export function useContratos(filters?: Record<string, any>, options?: UseContratosOptions) {
  return useQuery({
    queryKey: ['contratos', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: any[]; pagination: any }>('/contratos', { params: filters });
      return data;
    },
    enabled: options?.enabled !== false, // default true
    staleTime: 3000, 
    refetchOnMount: true,
  });
}

export function useContratosKPIs(options?: UseContratosOptions) {
  return useQuery({
    queryKey: ['contratos', 'kpis'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ pendentes: number; assinados: number; semContrato: number }>('/contratos/kpis');
      return data;
    },
    enabled: options?.enabled !== false, // default true
    staleTime: 3000,
    refetchOnMount: true,
  });
}

export function useCreateContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateContratoDTO) => {
      const { data } = await apiClient.post<Contrato>('/contratos', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('contrato.sucesso.criado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.criar');
      toast.error(message);
    },
  });
}

export function useDeleteContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      const { data } = await apiClient.delete(`/contratos/${contratoId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('contrato.sucesso.removido');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.remover');
      toast.error(message);
    },
  });
}

export function useSubstituirContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      const { data } = await apiClient.post(`/contratos/${contratoId}/substituir`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('contrato.sucesso.substituido');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.substituir');
      toast.error(message);
    },
  });
}

export function useReenviarContrato() {
  return useMutation({
    mutationFn: async (contratoId: string) => {
      const { data } = await apiClient.post(`/contratos/${contratoId}/reenviar`);
      return data;
    },
    onSuccess: () => {
      toast.success('contrato.sucesso.reenviado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.reenviar');
      toast.error(message);
    },
  });
}

export function useDownloadContrato() {
  return useMutation({
    mutationFn: async (contratoId: string) => {
      const response = await apiClient.get(`/contratos/${contratoId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${contratoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('contrato.sucesso.baixado');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.baixar');
      toast.error(message);
    },
  });
}

export function usePreviewContrato() {
  return useMutation({
    mutationFn: async (draftConfig?: any) => {
      // PWA/Mobile FIX: Open blank window IMMEDIATELY to preserve user gesture
      // Most mobile browsers block window.open if it's called after an async await.
      let newWindow: Window | null = null;
      if (!Capacitor.isNativePlatform()) {
        newWindow = window.open('about:blank', '_blank');
        if (newWindow) {
          newWindow.document.write('<!DOCTYPE html><html><head><title>Gerando Prévia...</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;background:#f9fafb;color:#4b5563;}</style></head><body><div style="text-align:center;"><div style="border:4px solid #f3f3f3;border-top:4px solid #3b82f6;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>Gerando prévia do contrato...</div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></body></html>');
        }
      }

      try {
        const response = await apiClient.post('/contratos/preview', draftConfig || {}, {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        if (newWindow) {
          newWindow.location.href = url;
        } else {
          // Native Capacitor or fallback
          await openBrowserLink(url);
        }
        
        return response.data;
      } catch (error) {
        if (newWindow) newWindow.close();
        throw error;
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.carregar');
      toast.error(message);
    },
  });
}
