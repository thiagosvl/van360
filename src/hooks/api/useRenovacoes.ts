import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import {
  ListRenovacoesParams,
  RenovacoesListResponse,
  ReajusteLotePayload,
  UpdateRenovacaoPayload,
  VirarAnoLetivoPayload,
} from "@/types/renovacao";
import { toast } from "sonner";

export const renovacaoKeys = {
  all: ["renovacoes"] as const,
  lists: () => [...renovacaoKeys.all, "list"] as const,
  list: (params: ListRenovacoesParams) => [...renovacaoKeys.lists(), params] as const,
};

export function useRenovacoesList(params: ListRenovacoesParams) {
  return useQuery({
    queryKey: renovacaoKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<RenovacoesListResponse>("/renovacoes", {
        params,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useReajusteLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReajusteLotePayload) => {
      const response = await apiClient.post("/renovacoes/reajuste-lote", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
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
      const response = await apiClient.post("/renovacoes/virar-ano", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
      toast.success(`Ano Letivo ${data.ano_destino} iniciado com sucesso!`, {
        description: `${data.confirmados_virados} passageiros promovidos e ${data.recusados_desativados} saídas registradas.`,
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao virar ano letivo", {
        description: error.response?.data?.error || "Verifique as pendências e tente novamente.",
      });
    },
  });
}
