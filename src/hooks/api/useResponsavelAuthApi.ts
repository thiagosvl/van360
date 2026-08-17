import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { responsavelApi } from "@/services/api/responsavel.api";
import { supabase } from "@/integrations/supabase/client";
import { RouteBroadcastEvent } from "@/types/enums";
import { RegistrarAusenciaPayload } from "@/types/responsavel";

export function broadcastAbsenceEvent(rotaId?: string, passageiroId?: string, dataAusencia?: string) {
  try {
    const channel = supabase.channel("van360-fleet-sync");
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: RouteBroadcastEvent.ABSENCE_CHANGED,
          payload: {
            rotaId,
            passageiroId,
            dataAusencia,
            timestamp: Date.now()
          }
        }).then(() => {
          setTimeout(() => {
            supabase.removeChannel(channel);
          }, 1000);
        });
      }
    });
  } catch (err) {
    console.error("[broadcastAbsenceEvent] Erro ao enviar broadcast de ausência:", err);
  }
}

export function useCheckPhoneMutation() {
  return useMutation({
    mutationFn: (telefone: string) => responsavelApi.checkPhone(telefone)
  });
}

export function useSetupPinMutation() {
  return useMutation({
    mutationFn: ({ telefone, pin }: { telefone: string; pin: string }) =>
      responsavelApi.setupPin(telefone, pin)
  });
}

export function useLoginResponsavelMutation() {
  return useMutation({
    mutationFn: ({ telefone, pin }: { telefone: string; pin: string }) =>
      responsavelApi.login(telefone, pin)
  });
}

export function useCarteirinhaQuery(passageiroId: string | null, token: string | null) {
  return useQuery({
    queryKey: ["carteirinha-responsavel", passageiroId],
    enabled: Boolean(passageiroId && token),
    staleTime: 1000 * 60 * 5,
    queryFn: () => responsavelApi.getCarteirinha(passageiroId!, token!)
  });
}

export function useResetPinResponsavelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ passageiroId, responsavelId }: { passageiroId: string; responsavelId?: string }) =>
      responsavelApi.resetPinByDriver(passageiroId, responsavelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["passageiro", variables.passageiroId] });
      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
    }
  });
}

export function useRegistrarAusenciaResponsavelMutation() {
  return useMutation({
    mutationFn: ({ passageiroId, payload, token }: { passageiroId: string; payload: RegistrarAusenciaPayload; token: string }) =>
      responsavelApi.registrarAusencia(passageiroId, payload, token),
    onSuccess: (data: any, variables) => {
      const rId = data?.rota_id || variables.payload.rota_id;
      broadcastAbsenceEvent(rId, variables.passageiroId, variables.payload.data_ausencia);
    }
  });
}

export function useRemoverAusenciaResponsavelMutation() {
  return useMutation({
    mutationFn: ({ passageiroId, ausenciaId, token, rotaId, dataAusencia }: { passageiroId: string; ausenciaId: string; token: string; rotaId?: string; dataAusencia?: string }) =>
      responsavelApi.removerAusencia(passageiroId, ausenciaId, token),
    onSuccess: (_, variables) => {
      broadcastAbsenceEvent(variables.rotaId, variables.passageiroId, variables.dataAusencia);
    }
  });
}

export function useUpdateObservacoesResponsavelMutation() {
  return useMutation({
    mutationFn: ({ passageiroId, observacoes, token }: { passageiroId: string; observacoes: string; token: string }) =>
      responsavelApi.updateObservacoes(passageiroId, token, observacoes)
  });
}

export function useAddResponsavelResponsavelMutation() {
  return useMutation({
    mutationFn: ({ passageiroId, payload, token }: { passageiroId: string; payload: Record<string, unknown>; token: string }) =>
      responsavelApi.addResponsavel(passageiroId, payload, token)
  });
}

export function useUpdateResponsavelResponsavelMutation() {
  return useMutation({
    mutationFn: ({ passageiroId, responsavelId, payload, token }: { passageiroId: string; responsavelId: string; payload: Record<string, unknown>; token: string }) =>
      responsavelApi.updateResponsavel(passageiroId, responsavelId, payload, token)
  });
}

export function useDeleteResponsavelResponsavelMutation() {
  return useMutation({
    mutationFn: ({ passageiroId, responsavelId, token }: { passageiroId: string; responsavelId: string; token: string }) =>
      responsavelApi.deleteResponsavel(passageiroId, responsavelId, token)
  });
}

export function useSetPrincipalResponsavelResponsavelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ passageiroId, responsavelId, token }: { passageiroId: string; responsavelId: string; token: string }) =>
      responsavelApi.setPrincipalResponsavel(passageiroId, responsavelId, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["carteirinha-responsavel", variables.passageiroId] });
    }
  });
}
