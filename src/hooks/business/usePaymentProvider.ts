import { useCallback } from "react";
import { useEfiPay } from "./useEfiPay";
import { PaymentProvider, CreditCardData } from "@/types/payment";

export const usePaymentProvider = (): PaymentProvider => {
  const efi = useEfiPay();

  const generatePaymentToken = useCallback(async (cardData: CreditCardData) => {
    return efi.generatePaymentToken({
      brand: cardData.brand || '',
      number: cardData.number || '',
      cvv: cardData.cvv || '',
      expirationMonth: cardData.expireMonth || '',
      expirationYear: cardData.expireYear || '',
      reuse: cardData.reuse,
      holderName: cardData.holderName,
      holderDocument: cardData.holderDocument,
    });
  }, [efi.generatePaymentToken]);

  return {
    isReady: efi.isReady,
    generatePaymentToken,
    getInstallments: efi.getInstallments,
  };
};
