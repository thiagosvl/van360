import { assinaturaCobrancaApi } from "@/services/api/assinatura-cobranca.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useGerarPixParaCobranca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cobrancaId: string) =>
      assinaturaCobrancaApi.gerarPixParaCobranca(cobrancaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assinatura-cobranca"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ||
            "Não foi possível gerar o código PIX. Tente novamente.";
      toast.error("assinatura.erro.gerarPix", {
        description: errorMessage,
      });
    },
  });
}

