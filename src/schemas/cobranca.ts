import { z } from "zod";
import { parseCurrencyToNumber } from "@/utils/formatters";
import { CobrancaTipoPagamento } from "@/types/enums";

export const paymentSchema = z.object({
  valor_pago: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => parseCurrencyToNumber(val) > 0, {
      message: "O valor deve ser maior que 0",
    }),
  data_pagamento: z.date({
    required_error: "A data de pagamento é obrigatória.",
  }),
  tipo_pagamento: z.nativeEnum(CobrancaTipoPagamento, {
    errorMap: () => ({ message: "A forma de pagamento é obrigatória." }),
  }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
