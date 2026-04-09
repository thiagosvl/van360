export interface CreditCardData {
  brand?: string;
  number: string;
  cvv: string;
  expireMonth: string;
  expireYear: string;
  reuse?: boolean;
  holderName?: string;
  holderDocument?: string;
}

export interface PaymentProvider {
  isReady: boolean;
  generatePaymentToken: (cardData: CreditCardData) => Promise<string>;
}

export type PaymentMethodType = 'pix' | 'credit_card';
