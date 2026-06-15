import { CheckoutPaymentMethod } from "@/types/enums";

export const PAYMENT_METHOD_LABELS: Record<CheckoutPaymentMethod, string> = {
  [CheckoutPaymentMethod.PIX]: "Pix",
  [CheckoutPaymentMethod.CREDIT_CARD]: "Cartão",
};
