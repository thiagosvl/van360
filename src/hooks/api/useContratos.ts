import { getMessage } from '@/constants/messages';
import { apiClient } from '@/services/api/client';
import { Contrato, CreateContratoDTO } from '@/types/contract';
import { openBrowserLink } from '@/utils/browser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
      toast.success(getMessage('contrato.sucesso.criado'));
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
      toast.success(getMessage('contrato.sucesso.removido'));
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
      toast.success(getMessage('contrato.sucesso.substituido'));
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
      toast.success(getMessage('contrato.sucesso.reenviado'));
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
      toast.success(getMessage('contrato.sucesso.baixado'));
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
      const response = await apiClient.post('/contratos/preview', draftConfig || {}, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      await openBrowserLink(url);
      // Note: we don't revoke here because it needs to stay open in the new tab.
      
      return response.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || getMessage('contrato.erro.carregar');
      toast.error(message);
    },
  });
}
