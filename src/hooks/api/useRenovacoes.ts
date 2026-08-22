import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import {
  ReajusteLotePayload,
  RenovacaoDashboardResponse,
  UpdateRenovacaoPayload,
  VirarAnoLetivoPayload,
} from "@/types/renovacao";
import { toast } from "@/utils/notifications/toast";

export function useRenovacoesList(params?: {
  ano_destino?: number;
  status?: string;
  escola_id?: string;
  periodo?: string;
  search?: string;
}) {
  return useQuery<RenovacaoDashboardResponse>({
    queryKey: ["renovacoes", params],
    queryFn: async () => {
      const response = await apiClient.get<RenovacaoDashboardResponse>("/renovacoes", {
        params,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useReajusteLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReajusteLotePayload) => {
      const response = await apiClient.patch<{ success: boolean; updated_count: number }>(
        "/renovacoes/reajuste-lote",
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["renovacoes"] });
      toast.success("Reajuste em lote aplicado com sucesso!", {
        description: `${data.updated_count} passageiros foram atualizados.`,
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao aplicar reajuste", {
        description: error.response?.data?.error || "Verifique os dados e tente novamente.",
      });
    },
  });
}

export function useUpdateRenovacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      passageiroId,
      data,
      payload,
    }: {
      passageiroId: string;
      data?: UpdateRenovacaoPayload;
      payload?: UpdateRenovacaoPayload;
    }) => {
      const body = data || payload;
      const response = await apiClient.put(
        `/renovacoes/${passageiroId}`,
        body
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovacoes"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar reserva", {
        description: error.response?.data?.error || "Verifique os dados e tente novamente.",
      });
    },
  });
}

export function useVirarAnoLetivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VirarAnoLetivoPayload) => {
      const response = await apiClient.post<{
        promovidos: number;
        inativados: number;
        ano_destino: number;
      }>("/renovacoes/virar-ano", payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["renovacoes"] });
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Ano Letivo ${data.ano_destino} iniciado com sucesso!`, {
        description: `${data.promovidos} passageiros confirmados foram atualizados e ${data.inativados} saídas foram finalizadas.`,
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao virar ano letivo", {
        description: error.response?.data?.error || "Verifique os dados e tente novamente.",
      });
    },
  });
}
