import { RegistrarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import { Cobranca } from "@/types/cobranca";
import { useRegistrarPagamentoManual } from "@/hooks";
import { PaymentFormData, paymentSchema } from "@/schemas/cobranca";
import { moneyMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getNowBR, toISODateTimeBR } from "@/utils/dateUtils";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
import { buildReciboWhatsAppMessage } from "@/utils/whatsappTemplates";

import { safeCloseDialog } from "@/hooks";

interface ManualPaymentViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  valorOriginal: number;
  passageiroNome?: string;
  observacao?: string | null;
  onPaymentRecorded: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: RegistrarPagamentoManualDTO) => void;
}

export function useManualPaymentViewModel({
  isOpen,
  onClose,
  cobrancaId,
  valorOriginal,
  passageiroNome,
  observacao,
  onPaymentRecorded,
}: ManualPaymentViewModelProps) {
  const registrarPagamento = useRegistrarPagamentoManual();
  const [openCalendar, setOpenCalendar] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      valor_pago: "",
      data_pagamento: getNowBR(),
      enviar_recibo_whatsapp_manual: false,
      observacao: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const valorEmCentavos = Math.round(Number(valorOriginal) * 100);
      form.reset({
        valor_pago: moneyMask(String(valorEmCentavos)),
        data_pagamento: getNowBR(),
        tipo_pagamento: undefined,
        enviar_recibo_whatsapp_manual: false,
        observacao: "",
      });
    }
  }, [isOpen, valorOriginal, form]);

  const handleSubmit = useCallback(async (data: PaymentFormData) => {
    const pagamentoData: RegistrarPagamentoManualDTO = {
      valor_pago: typeof data.valor_pago === 'string' ? parseCurrencyToNumber(data.valor_pago) : data.valor_pago,
      data_pagamento: toISODateTimeBR(data.data_pagamento),
      tipo_pagamento: data.tipo_pagamento,
      observacao: data.observacao?.trim() ? data.observacao.trim() : null,
    };

    registrarPagamento.mutate(
      { cobrancaId, data: pagamentoData },
      {
        onSuccess: async (updatedCobranca) => {
          onPaymentRecorded(updatedCobranca, pagamentoData);
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
  }, [cobrancaId, passageiroNome, registrarPagamento, onPaymentRecorded, onClose]);

  const onFormError = useCallback(() => {
    toast.error("validacao.formularioComErros");
  }, []);

  return {
    form,
    openCalendar,
    setOpenCalendar,
    handleSubmit,
    onFormError,
    isPending: registrarPagamento.isPending,
  };
}
