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

interface ManualPaymentViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  valorOriginal: number;
  passageiroNome?: string;
  onPaymentRecorded: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: RegistrarPagamentoManualDTO) => void;
}

export function useManualPaymentViewModel({
  isOpen,
  onClose,
  cobrancaId,
  valorOriginal,
  passageiroNome,
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
      });
    }
  }, [isOpen, valorOriginal, form]);

  const handleSubmit = useCallback(async (data: PaymentFormData) => {
    const pagamentoData: RegistrarPagamentoManualDTO = {
      valor_pago: typeof data.valor_pago === 'string' ? parseCurrencyToNumber(data.valor_pago) : data.valor_pago,
      data_pagamento: toISODateTimeBR(data.data_pagamento),
      tipo_pagamento: data.tipo_pagamento,
    };

    registrarPagamento.mutate(
      { cobrancaId, data: pagamentoData },
      {
        onSuccess: async (updatedCobranca) => {
          onPaymentRecorded(updatedCobranca, pagamentoData);
          onClose();

          if (data.enviar_recibo_whatsapp_manual && updatedCobranca?.recibo_url) {
            const mes = updatedCobranca.mes;
            const ano = updatedCobranca.ano;
            await shareReceiptFile({
              url: updatedCobranca.recibo_url,
              filename: `recibo-${mes || ""}-${ano || ""}.png`.toLowerCase(),
              title: "Recibo Van360",
              text: `Recibo de ${mes}/${ano} - ${passageiroNome || ""}`.trim(),
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
