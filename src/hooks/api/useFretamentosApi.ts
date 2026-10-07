import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fretamentoApi,
  type CriarFretamentoPayload,
  type AtualizarFretamentoPayload,
  type RegistrarPagamentoPayload,
  type AdicionarParticipantePayload,
  type FretamentoTipo,
  type FretamentoStatus,
  type ParticipantePagamentoStatus,
  type TipoPagamento,
} from "@/services/api/fretamento.api";

export const FRETAMENTOS_QUERY_KEYS = {
  all: ["fretamentos"] as const,
  list: (mes: number, ano: number, tipo?: FretamentoTipo, status?: FretamentoStatus) =>
    [...FRETAMENTOS_QUERY_KEYS.all, "list", { mes, ano, tipo, status }] as const,
  resumo: (mes: number, ano: number) =>
    [...FRETAMENTOS_QUERY_KEYS.all, "resumo", { mes, ano }] as const,
  details: (id: string) => [...FRETAMENTOS_QUERY_KEYS.all, "detail", id] as const,
  publico: (slug: string) => [...FRETAMENTOS_QUERY_KEYS.all, "publico", slug] as const,
};

export const useFretamentosListQuery = (
  mes: number,
  ano: number,
  tipo?: FretamentoTipo,
  status?: FretamentoStatus,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: FRETAMENTOS_QUERY_KEYS.list(mes, ano, tipo, status),
    queryFn: () => fretamentoApi.listar({ mes, ano, tipo, status }),
    enabled,
  });
};

export const useFretamentoResumoQuery = (mes: number, ano: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: FRETAMENTOS_QUERY_KEYS.resumo(mes, ano),
    queryFn: () => fretamentoApi.resumoFinanceiro({ mes, ano }),
    enabled,
  });
};

export const useFretamentoDetalhesQuery = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: FRETAMENTOS_QUERY_KEYS.details(id),
    queryFn: () => fretamentoApi.obterPorId(id),
    enabled: !!id && enabled,
  });
};

export const usePasseioPublicoQuery = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: FRETAMENTOS_QUERY_KEYS.publico(slug),
    queryFn: () => fretamentoApi.obterPublico(slug),
    enabled: !!slug && enabled,
  });
};

export const useCriarFretamentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarFretamentoPayload) => fretamentoApi.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
    },
  });
};

export const useAtualizarFretamentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarFretamentoPayload }) =>
      fretamentoApi.atualizar(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.details(variables.id) });
    },
  });
};

export const useDeletarFretamentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fretamentoApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
    },
  });
};

export const useRegistrarPagamentoFretamentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fretamentoId, payload }: { fretamentoId: string; payload: RegistrarPagamentoPayload }) =>
      fretamentoApi.registrarPagamento(fretamentoId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.details(variables.fretamentoId) });
    },
  });
};

export const useDeletarPagamentoFretamentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fretamentoId, pagamentoId }: { fretamentoId: string; pagamentoId: string }) =>
      fretamentoApi.deletarPagamento(fretamentoId, pagamentoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.details(variables.fretamentoId) });
    },
  });
};

export const useAdicionarParticipanteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fretamentoId, payload }: { fretamentoId: string; payload: AdicionarParticipantePayload }) =>
      fretamentoApi.adicionarParticipante(fretamentoId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.details(variables.fretamentoId) });
    },
  });
};

export const useAtualizarStatusParticipanteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fretamentoId,
      participanteId,
      payload,
    }: {
      fretamentoId: string;
      participanteId: string;
      payload: { status_pagamento: ParticipantePagamentoStatus; tipo_pagamento?: TipoPagamento | null };
    }) => fretamentoApi.atualizarStatusParticipante(fretamentoId, participanteId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.details(variables.fretamentoId) });
    },
  });
};

export const useRemoverParticipanteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fretamentoId, participanteId }: { fretamentoId: string; participanteId: string }) =>
      fretamentoApi.removerParticipante(fretamentoId, participanteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FRETAMENTOS_QUERY_KEYS.details(variables.fretamentoId) });
    },
  });
};

export const useInscreverPublicoMutation = () => {
  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: AdicionarParticipantePayload }) =>
      fretamentoApi.inscreverPublico(slug, payload),
  });
};
