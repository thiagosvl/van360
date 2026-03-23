import { RegistrarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import { useRegistrarPagamentoManual } from "@/hooks";
import { PaymentFormData, paymentSchema } from "@/schemas/cobranca";
import { moneyMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ManualPaymentViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  valorOriginal: number;
  onPaymentRecorded: () => void;
}

export function useManualPaymentViewModel({
  isOpen,
  onClose,
  cobrancaId,
  valorOriginal,
  onPaymentRecorded,
}: ManualPaymentViewModelProps) {
  const registrarPagamento = useRegistrarPagamentoManual();
  const [openCalendar, setOpenCalendar] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      valor_pago: "",
      data_pagamento: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      const valorEmCentavos = Math.round(Number(valorOriginal) * 100);
      form.reset({
        valor_pago: moneyMask(String(valorEmCentavos)),
        data_pagamento: new Date(),
        tipo_pagamento: undefined,
      });
    }
  }, [isOpen, valorOriginal, form]);

  const handleSubmit = useCallback(async (data: PaymentFormData) => {
    const pagamentoData: RegistrarPagamentoManualDTO = {
      valor_pago: data.valor_pago,
      data_pagamento: data.data_pagamento.toISOString(),
      tipo_pagamento: data.tipo_pagamento,
    };

    registrarPagamento.mutate(
      { cobrancaId, data: pagamentoData },
      {
        onSuccess: () => {
          onPaymentRecorded();
          onClose();
        },
      }
    );
  }, [cobrancaId, registrarPagamento, onPaymentRecorded, onClose]);

  return {
    form,
    openCalendar,
    setOpenCalendar,
    handleSubmit,
    isPending: registrarPagamento.isPending,
  };
}
