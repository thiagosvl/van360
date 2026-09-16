import { apiClient } from '@/services/api/client';
import { ContratoProvider, ContratoStatus } from '@/types/enums';
import { toast } from '@/utils/notifications/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface PublicContract {
  id: string;
  usuario_id: string;
  passageiro_id: string;
  status: ContratoStatus;
  minuta_url: string;
  contrato_url?: string;
  contrato_final_url?: string;
  provider: ContratoProvider;
  created_at: string;
  dados_contrato?: Record<string, unknown> | null;
  usuario?: {
    id: string;
    nome: string;
    apelido?: string | null;
    razao_social?: string | null;
    cpfcnpj?: string | null;
    telefone?: string | null;
    email?: string | null;
    logo_url?: string | null;
  } | null;
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
      toast.error('contrato.erro.assinar');
    },
  });
}
