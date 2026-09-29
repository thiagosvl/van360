import { ComplementarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import { Cobranca } from "@/types/cobranca";
import { useComplementarPagamentoManual } from "@/hooks";
import { ComplementarPaymentFormData, complementarPaymentSchema } from "@/schemas/cobranca";
import { safeCloseDialog } from "@/hooks";
import { moneyMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getNowBR, toISODateTimeBR } from "@/utils/dateUtils";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
import { buildReciboWhatsAppMessage } from "@/utils/whatsappTemplates";

interface ComplementarPagamentoViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  valorOriginal: number;
  valorJaPago: number;
  passageiroNome?: string;
  observacao?: string | null;
  onPaymentRecorded: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: ComplementarPagamentoManualDTO) => void;
}

export function useComplementarPagamentoViewModel({
  isOpen,
  onClose,
  cobrancaId,
  valorOriginal,
  valorJaPago,
  passageiroNome,
  observacao,
  onPaymentRecorded,
}: ComplementarPagamentoViewModelProps) {
  const complementarPagamento = useComplementarPagamentoManual();
  const [openCalendar, setOpenCalendar] = useState(false);

  const saldoRestanteAtual = useMemo(() => {
    return Math.max(0, Number(valorOriginal) - Number(valorJaPago));
  }, [valorOriginal, valorJaPago]);

  const form = useForm<ComplementarPaymentFormData>({
    resolver: zodResolver(complementarPaymentSchema),
    defaultValues: {
      valor_adicional: "",
      data_pagamento: getNowBR(),
      enviar_recibo_whatsapp_manual: false,
      observacao: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const centavosSaldo = Math.round(saldoRestanteAtual * 100);
      form.reset({
        valor_adicional: centavosSaldo > 0 ? moneyMask(String(centavosSaldo)) : "",
        data_pagamento: getNowBR(),
        tipo_pagamento: undefined,
        enviar_recibo_whatsapp_manual: false,
        observacao: "",
      });
    }
  }, [isOpen, saldoRestanteAtual, form]);

  const valorAdicionalWatcher = useWatch({
    control: form.control,
    name: "valor_adicional",
  });

  const valorAdicionalNumerico = useMemo(() => {
    if (!valorAdicionalWatcher) return 0;
    return typeof valorAdicionalWatcher === "number"
      ? valorAdicionalWatcher
      : parseCurrencyToNumber(valorAdicionalWatcher);
  }, [valorAdicionalWatcher]);

  const novoTotalPago = useMemo(() => {
    return Number(valorJaPago) + valorAdicionalNumerico;
  }, [valorJaPago, valorAdicionalNumerico]);

  const novoSaldoRestante = useMemo(() => {
    return Math.max(0, Number(valorOriginal) - novoTotalPago);
  }, [valorOriginal, novoTotalPago]);

  const isQuitaTotal = useMemo(() => {
    return novoTotalPago >= Number(valorOriginal);
  }, [novoTotalPago, valorOriginal]);

  const handleSubmit = useCallback(async (data: ComplementarPaymentFormData) => {
    const valorAdicionalNumber = typeof data.valor_adicional === "string"
      ? parseCurrencyToNumber(data.valor_adicional)
      : data.valor_adicional;

    const payload: ComplementarPagamentoManualDTO = {
      valor_adicional: valorAdicionalNumber,
      data_pagamento: toISODateTimeBR(data.data_pagamento),
      tipo_pagamento: data.tipo_pagamento,
      observacao: data.observacao?.trim() ? data.observacao.trim() : null,
    };

    complementarPagamento.mutate(
      { cobrancaId, data: payload },
      {
        onSuccess: async (updatedCobranca) => {
          onPaymentRecorded(updatedCobranca, payload);
          safeCloseDialog(onClose);

          if (data.enviar_recibo_whatsapp_manual && updatedCobranca?.recibo_url) {
            const mes = updatedCobranca.mes;
            const ano = updatedCobranca.ano;
            const text = buildReciboWhatsAppMessage({
              nomeResponsavel: updatedCobranca.passageiro?.responsavel_principal?.nome,
              nomePassageiro: passageiroNome || updatedCobranca.passageiro?.nome || "",
              generoPassageiro: updatedCobranca.passageiro?.genero,
              mes: Number(mes),
              ano: Number(ano),
            });

            await shareReceiptFile({
              url: updatedCobranca.recibo_url,
              filename: `recibo-${mes || ""}-${ano || ""}.png`.toLowerCase(),
              title: "Recibo Van360",
              text,
            });
          }
        },
      }
    );
  }, [cobrancaId, passageiroNome, complementarPagamento, onPaymentRecorded, onClose]);

  const onFormError = useCallback(() => {
    toast.error("validacao.formularioComErros");
  }, []);

  return {
    form,
    openCalendar,
    setOpenCalendar,
    saldoRestanteAtual,
    valorAdicionalNumerico,
    novoTotalPago,
    novoSaldoRestante,
    isQuitaTotal,
    handleSubmit,
    onFormError,
    isPending: complementarPagamento.isPending,
  };
}
