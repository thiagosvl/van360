import { useEfiPay } from "./useEfiPay";
import { PaymentProvider } from "@/types/payment";

export const usePaymentProvider = (): PaymentProvider => {
  // Atualmente suportamos apenas Efí Pay, mas este hook permite abstrair outros no futuro.
  const efi = useEfiPay();

  return {
    isReady: efi.isReady,
    generatePaymentToken: async (cardData) => {
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
    },
  };
};
