import { useState, useCallback } from 'react';
import EfiPay from 'payment-token-efi';

interface EfiCardData {
  brand: string;
  number: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  reuse?: boolean;
  holderName?: string;
  holderDocument?: string;
}

/**
 * Hook para integração com Efí Pay usando o SDK oficial 'payment-token-efi'.
 * Corrigido para utilizar camelCase nos campos conforme documentação do pacote NPM.
 */
export const useEfiPay = () => {
  const [isReady] = useState(true);

  const accountIdentifier = import.meta.env.VITE_EFI_ACCOUNT_ID;
  const isProduction = import.meta.env.MODE === 'production';

  const generatePaymentToken = useCallback(async (cardData: EfiCardData): Promise<string> => {
    if (!accountIdentifier) {
      throw new Error('Configuração de pagamento ausente (Account ID).');
    }

    try {
      // Configuração global/instância do SDK
      EfiPay.CreditCard
        .setAccount(accountIdentifier)
        .setEnvironment(isProduction ? 'production' : 'sandbox');

      // Configuração dos dados do cartão
      const efi = EfiPay.CreditCard.setCreditCardData({
        brand: cardData.brand,
        number: cardData.number.replace(/\D/g, ''),
        cvv: cardData.cvv,
        expirationMonth: cardData.expirationMonth,
        expirationYear: cardData.expirationYear,
        holderName: cardData.holderName || '',
        holderDocument: cardData.holderDocument || '',
        reuse: cardData.reuse ?? false
      });

      const response = await efi.getPaymentToken();

      // De acordo com a documentação do NPM, o retorno costuma ser o objeto 
      // diretamente contendo payment_token ou erro.
      if (response && typeof response === 'object' && 'payment_token' in response) {
        const token = (response as { payment_token: string }).payment_token;
        return token;
      }

      // Caso o retorno ainda siga o padrão legado do response.data (raro no NPM mas possível por retrocompatibilidade)
      const legacyResponse = response as any;
      if (legacyResponse && legacyResponse.code === 200 && legacyResponse.data?.payment_token) {
        return legacyResponse.data.payment_token;
      }

      // Tratamento de erro
      const errorMsg = (response as any)?.error_description || (response as any)?.message || 'Falha ao tokenizar cartão.';
      throw new Error(errorMsg);

    } catch (error: any) {
      throw error;
    }
  }, [accountIdentifier, isProduction]);

  return {
    isReady,
    generatePaymentToken
  };
};
