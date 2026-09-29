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

export interface SignContractParams {
  token: string;
  assinatura: string;
  metadados: Record<string, unknown>;
}

export interface SignContractResponse {
  documentoFinalUrl?: string;
  contrato_url?: string;
  assinadoEm?: string;
}

export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, assinatura, metadados }: SignContractParams) => {
      const { data } = await apiClient.post<SignContractResponse>(`/contratos/publico/${token}/assinar`, {
        assinatura,
        metadados,
      });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<PublicContract>(['public-contract', variables.token], (old) => {
        if (!old) return old;
        return {
          ...old,
          status: ContratoStatus.ASSINADO,
          contrato_final_url: data.documentoFinalUrl || data.contrato_url || old.contrato_final_url,
          contrato_url: data.contrato_url || old.contrato_url,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['public-contract', variables.token] });
    },
    onError: () => {
      toast.error('contrato.erro.assinar');
    },
  });
}
