import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { RenovacaoStatus } from "@/types/enums";
import { apiClient } from "@/services/api/client";
import {
  ListRenovacoesParams,
  RenovacoesListResponse,
  ReajusteLotePayload,
  UpdateRenovacaoPayload,
  VirarAnoLetivoPayload,
  PublicRenovacaoResponse,
  AtualizarDadosPublicosPayload,
  ResponderRenovacaoPayload,
  ResponderRenovacaoResponse,
  NotificarRenovacaoResponse,
  NotificarLoteRenovacaoResponse,
} from "@/types/renovacao";
import { toast } from "sonner";

export const renovacaoKeys = {
  all: ["renovacoes"] as const,
  lists: () => [...renovacaoKeys.all, "list"] as const,
  list: (params: ListRenovacoesParams) => [...renovacaoKeys.lists(), params] as const,
  contratoConfig: (ano: number) => [...renovacaoKeys.all, "contrato-config", ano] as const,
  public: (token: string) => [...renovacaoKeys.all, "public", token] as const,
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
    staleTime: 1000 * 60 * 2,
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
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
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
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      toast.error("Erro ao atualizar reserva", {
        description: error.response?.data?.error || "Verifique os dados e tente novamente.",
      });
    },
  });
}

export interface AtualizarStatusLotePayload {
  ano_destino: number;
  passageiro_ids: string[];
  status: RenovacaoStatus;
}

export function useAtualizarStatusLoteRenovacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AtualizarStatusLotePayload) => {
      const response = await apiClient.post("/renovacoes/status-lote", payload);
      return response.data as { success: boolean; updated_count: number };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      toast.error("Erro ao atualizar em lote", {
        description: error.response?.data?.error || "Ocorreu um erro ao atualizar os passageiros.",
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
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      toast.error("Erro ao virar ano letivo", {
        description: error.response?.data?.error || "Verifique as pendências e tente novamente.",
      });
    },
  });
}

export function usePublicRenovacao(token?: string) {
  return useQuery({
    queryKey: renovacaoKeys.public(token || ""),
    queryFn: async () => {
      if (!token) throw new Error("Token obrigatório");
      const response = await apiClient.get<PublicRenovacaoResponse>(`/public/renovacao/${token}`);
      return response.data;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useResponderPublicRenovacao(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ResponderRenovacaoPayload) => {
      if (!token) throw new Error("Token obrigatório");
      const response = await apiClient.post<ResponderRenovacaoResponse>(
        `/public/renovacao/${token}/responder`,
        payload
      );
      return response.data;
    },
    onSuccess: async () => {
      if (token) {
        await queryClient.invalidateQueries({ queryKey: renovacaoKeys.public(token) });
      }
    },
  });
}

export function useAtualizarDadosPublicosRenovacao(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AtualizarDadosPublicosPayload) => {
      if (!token) throw new Error("Token obrigatório");
      const response = await apiClient.patch(`/public/renovacao/${token}/dados`, payload);
      return response.data;
    },
    onSuccess: async () => {
      if (token) {
        await queryClient.invalidateQueries({ queryKey: renovacaoKeys.public(token) });
      }
    },
  });
}

export function useNotificarPassageiroRenovacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      passageiroId,
      anoDestino,
    }: {
      passageiroId: string;
      anoDestino: number;
    }) => {
      const response = await apiClient.post<NotificarRenovacaoResponse>(
        `/renovacoes/${passageiroId}/notificar`,
        { ano_destino: anoDestino }
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      toast.error("Erro ao enviar notificação WhatsApp", {
        description: error.response?.data?.error || "Verifique o telefone cadastrado.",
      });
    },
  });
}

export function useNotificarLoteRenovacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      anoDestino,
      passageiroIds,
    }: {
      anoDestino: number;
      passageiroIds?: string[];
    }) => {
      const response = await apiClient.post<NotificarLoteRenovacaoResponse>(
        "/renovacoes/notificar-lote",
        {
          ano_destino: anoDestino,
          passageiro_ids: passageiroIds,
        }
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      toast.error("Erro ao disparar notificações em lote", {
        description: error.response?.data?.error || "Tente novamente mais tarde.",
      });
    },
  });
}

export interface RenovacaoContratoConfigResponse {
  ano: number;
  customizado_para_ano: boolean;
  usar_contratos: boolean;
  multa_atraso: { valor: number; tipo: any } | null;
  juros_atraso: { valor: number; tipo: any } | null;
  multa_rescisao: { valor: number; tipo: any } | null;
  secoes: any[] | null;
  clausulas: string[] | null;
  tem_assinatura_digital: boolean;
  logo_url: string | null;
}

export interface SalvarRenovacaoContratoConfigPayload {
  ano: number;
  usar_contratos: boolean;
  multa_atraso?: { valor: number; tipo: any } | null;
  juros_atraso?: { valor: number; tipo: any } | null;
  multa_rescisao?: { valor: number; tipo: any } | null;
  secoes?: any[] | null;
  clausulas?: string[] | null;
}

export function useRenovacaoContratoConfig(ano: number) {
  return useQuery({
    queryKey: renovacaoKeys.contratoConfig(ano),
    queryFn: async () => {
      const response = await apiClient.get<RenovacaoContratoConfigResponse>("/renovacoes/config-contrato", {
        params: { ano },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSalvarRenovacaoContratoConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SalvarRenovacaoContratoConfigPayload) => {
      const response = await apiClient.put<RenovacaoContratoConfigResponse>(
        "/renovacoes/config-contrato",
        payload
      );
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.contratoConfig(variables.ano) });
      await queryClient.invalidateQueries({ queryKey: renovacaoKeys.all });
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      toast.error("Erro ao salvar configuração de contrato", {
        description: error.response?.data?.error || "Verifique os dados e tente novamente.",
      });
    },
  });
}
