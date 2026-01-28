import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Contrato {
  id: string;
  usuario_id: string;
  passageiro_id: string;
  token_acesso: string;
  status: 'pendente' | 'assinado' | 'cancelado' | 'expirado';
  provider: string;
  minuta_url: string;
  contrato_final_url?: string;
  dados_contrato: any;
  created_at: string;
  assinado_em?: string;
}

interface CreateContratoDTO {
  passageiroId: string;
  provider?: 'inhouse' | 'assinafy';
}

export function useContratos(filters?: any) {
  return useQuery({
    queryKey: ['contratos', filters],
    queryFn: async () => {
      const { data } = await api.get('/contratos', { params: filters });
      return data;
    },
  });
}

export function useCreateContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateContratoDTO) => {
      const { data } = await api.post('/contratos', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar contrato');
    },
  });
}

export function useCancelContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      const { data } = await api.delete(`/contratos/${contratoId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('Contrato cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao cancelar contrato');
    },
  });
}

export function useDownloadContrato() {
  return useMutation({
    mutationFn: async (contratoId: string) => {
      const response = await api.get(`/contratos/${contratoId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${contratoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('Contrato baixado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao baixar contrato');
    },
  });
}
