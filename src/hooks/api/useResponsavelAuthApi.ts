import { responsavelApi } from "@/services/api/responsavel.api";
import { useMutation, useQuery } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: ({ passageiroId, responsavelId }: { passageiroId: string; responsavelId?: string }) =>
      responsavelApi.resetPinByDriver(passageiroId, responsavelId)
  });
}
