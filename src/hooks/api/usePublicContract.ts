import { apiClient } from '@/services/api/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface PublicContract {
  id: string;
  status: string;
  minuta_url: string;
  dados_contrato: {
    nomePassageiro: string;
    nomeResponsavel: string;
    valorMensal: number;
    // Add other fields if necessary for display
  };
}

export function useGetPublicContract(token: string) {
  return useQuery({
    queryKey: ['public-contract', token],
    queryFn: async () => {
      const { data } = await apiClient.get<PublicContract>(`/contratos/publico/${token}`);
      return data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useSignContract() {
  return useMutation({
    mutationFn: async ({ token, assinatura, metadados }: { token: string; assinatura: string; metadados: any }) => {
      const { data } = await apiClient.post(`/contratos/publico/${token}/assinar`, {
        assinatura,
        metadados,
      });
      return data;
    },
    onError: (error: any) => {
      toast.error('Erro ao assinar contrato. Tente novamente.');
    },
  });
}
