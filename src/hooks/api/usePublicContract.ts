import { apiClient } from '@/services/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ContratoStatus = 'pendente' | 'assinado' | 'substituido';

export interface PublicContract {
  id: string;
  usuario_id: string;
  passageiro_id: string;
  status: ContratoStatus;
  minuta_url: string;
  contrato_url?: string;
  contrato_final_url?: string;
  provider: 'inhouse' | 'assinafy';
  created_at: string;
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, assinatura, metadados }: { token: string; assinatura: string; metadados: any }) => {
      const { data } = await apiClient.post(`/contratos/publico/${token}/assinar`, {
        assinatura,
        metadados,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public-contract', variables.token] });
    },
    onError: (error: any) => {
      toast.error('Erro ao assinar contrato. Tente novamente.');
    },
  });
}
