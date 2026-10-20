import { useCallback } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Passageiro } from "@/types/passageiro";
import { useQueryClient } from "@tanstack/react-query";

export interface IniciarFluxoGerarContratoParams {
  passageiro: Passageiro;
  anoLetivo?: number;
  isSubstituicao?: boolean;
  contratoIdParaSubstituir?: string;
  onSuccess?: () => void;
}

export function useGerarContratoFlow() {
  const { openConfirmarGerarContratoDialog } = useLayout();
  const queryClient = useQueryClient();

  const iniciarFluxoGerarContrato = useCallback(
    ({
      passageiro,
      anoLetivo,
      isSubstituicao = false,
      contratoIdParaSubstituir,
      onSuccess,
    }: IniciarFluxoGerarContratoParams) => {
      const passageiroResolvido: Passageiro = {
        ...passageiro,
        ano_letivo: passageiro.ano_letivo || anoLetivo,
      };

      if (passageiroResolvido.id) {
        queryClient.setQueryData(
          ["passageiro", passageiroResolvido.id],
          (old: unknown) => old || passageiroResolvido
        );
      }

      openConfirmarGerarContratoDialog({
        passageiro: passageiroResolvido,
        valorMensal: passageiroResolvido.valor_cobranca ? Number(passageiroResolvido.valor_cobranca) : undefined,
        diaVencimento: passageiroResolvido.dia_vencimento ? Number(passageiroResolvido.dia_vencimento) : undefined,
        dataInicio: passageiroResolvido.data_inicio_transporte || undefined,
        dataFim: passageiroResolvido.data_fim_transporte || undefined,
        ano: anoLetivo || (passageiroResolvido.ano_letivo ? Number(passageiroResolvido.ano_letivo) : undefined),
        isSubstituicao,
        contratoIdParaSubstituir,
        onSuccess,
      });
    },
    [openConfirmarGerarContratoDialog, queryClient]
  );

  return { iniciarFluxoGerarContrato };
}
