import { gastoApi } from "@/services/api/gasto.api";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/business/useProfile";

import { Gasto } from "@/types/gasto";
import { GastoEscopoAcao } from "@/types/enums";

let lastLocalGastoMutationTime = 0;
const lastRealtimeGastoSyncMap = new Map<string, number>();

export function markLocalGastoMutation() {
  lastLocalGastoMutationTime = Date.now();
}

export function isRecentLocalGastoMutation(thresholdMs = 2500): boolean {
  return Date.now() - lastLocalGastoMutationTime < thresholdMs;
}

export function debounceRealtimeGastoSync(key: string, callback: () => void, windowMs = 1500): boolean {
  const now = Date.now();
  const lastSync = lastRealtimeGastoSyncMap.get(key) || 0;
  if (now - lastSync < windowMs) {
    return false;
  }
  lastRealtimeGastoSyncMap.set(key, now);
  callback();
  return true;
}

export function broadcastGastoEvent(donoContaId?: string, veiculoId?: string, gastoData?: string | Date) {
  let mes: number | undefined;
  let ano: number | undefined;

  if (gastoData) {
    const d = typeof gastoData === "string" ? new Date(gastoData) : gastoData;
    if (!isNaN(d.getTime())) {
      mes = d.getMonth() + 1;
      ano = d.getFullYear();
    }
  }

  try {
    const channel = supabase.channel("van360-fleet-sync");
    channel.send({
      type: "broadcast",
      event: "gasto_changed",
      payload: {
        donoContaId,
        veiculoId,
        mes,
        ano,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    console.error("Erro ao enviar broadcast de gasto:", err);
  }
}

export function useCreateGasto() {
  const queryClient = useQueryClient();
  const { profile, donoContaId } = useProfile();

  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: Partial<Gasto> }) => {
      markLocalGastoMutation();
      return gastoApi.createGasto(usuarioId, data);
    },
    onSuccess: (_, variables) => {
      markLocalGastoMutation();
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      toast.success("gasto.sucesso.criado");
      const targetDonoId = donoContaId || variables.usuarioId;
      broadcastGastoEvent(targetDonoId, variables.data?.veiculo_id, variables.data?.data);
    },
    onError: (error: any) => {
      toast.error("gasto.erro.criar", {
        description: getErrorMessage(error, "Não foi possível criar o gasto."),
      });
    },
  });
}

export function useUpdateGasto() {
  const queryClient = useQueryClient();
  const { profile, donoContaId } = useProfile();

  return useMutation({
    mutationFn: ({ id, data, escopo }: { id: string; data: Partial<Gasto>; escopo?: GastoEscopoAcao }) => {
      markLocalGastoMutation();
      return gastoApi.updateGasto(id, data, escopo);
    },
    onError: (error: any) => {
      toast.error("gasto.erro.atualizar", {
        description: getErrorMessage(error, "Não foi possível atualizar o gasto."),
      });
    },
    onSuccess: (_, variables) => {
      markLocalGastoMutation();
      toast.success("gasto.sucesso.atualizado");
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      broadcastGastoEvent(donoContaId, variables.data?.veiculo_id, variables.data?.data);
    },
  });
}

export function useDeleteGasto() {
  const queryClient = useQueryClient();
  const { profile, donoContaId } = useProfile();

  return useMutation({
    mutationFn: ({ id, escopo }: { id: string; escopo?: GastoEscopoAcao }) => {
      markLocalGastoMutation();
      return gastoApi.deleteGasto(id, escopo);
    },
    onError: (error: any) => {
      toast.error("gasto.erro.excluir", {
        description: getErrorMessage(error, "Não foi possível excluir o gasto."),
      });
    },
    onSuccess: () => {
      markLocalGastoMutation();
      toast.success("gasto.sucesso.excluido");
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      broadcastGastoEvent(donoContaId);
    },
  });
}
