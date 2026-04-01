import { getMessage } from "@/constants/messages";
import { contratoApi } from "@/services/api/contrato.api";
import { Contrato, CreateContratoDTO } from "@/types/contract";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseContratosOptions {
  enabled?: boolean;
}

export function useContratos(
  filters?: Record<string, any>,
  options?: UseContratosOptions
) {
  return useQuery({
    queryKey: ["contratos", JSON.stringify(filters)],
    queryFn: async () => {
      const data = await contratoApi.listContratos(filters);
      return data;
    },
    enabled: options?.enabled !== false,
    staleTime: 3000,
    refetchOnMount: true,
    select: (data) => ({
      list: data.data ?? [],
      pagination: data.pagination,
      total: data.data?.length ?? 0,
    }),
  });
}

export function useContratosKPIs(options?: UseContratosOptions) {
  return useQuery({
    queryKey: ["contratos", "kpis"],
    queryFn: async () => {
      return await contratoApi.getKPIs();
    },
    enabled: options?.enabled !== false,
    staleTime: 3000,
    refetchOnMount: true,
  });
}

export function useCreateContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateContratoDTO) => {
      return await contratoApi.createContrato(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro"] });
      toast.success("contrato.sucesso.gerado");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || getMessage("contrato.erro.criar");
      toast.error(message);
    },
  });
}

export function useDeleteContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      return await contratoApi.deleteContrato(contratoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro"] });
      toast.success("contrato.sucesso.removido");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || getMessage("contrato.erro.excluir");
      toast.error(message);
    },
  });
}

export function useSubstituirContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      return await contratoApi.substituirContrato(contratoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["passageiro"] });
      toast.success("contrato.sucesso.substituido");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || getMessage("contrato.erro.substituir");
      toast.error(message);
    },
  });
}

export function usePreviewContrato() {
  return useMutation({
    mutationFn: async (draftConfig?: any) => {
      const data = await contratoApi.previewContrato(draftConfig);
      const blob = new Blob([data as any], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      return { url, blob };
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || getMessage("contrato.erro.carregar");
      toast.error(message);
    },
  });
}

