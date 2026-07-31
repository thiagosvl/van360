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

export interface InstallmentOption {
  installment: number;
  has_interest: boolean;
  value: number;
  currency: string;
  interest_percentage: number;
}

export interface PaymentProvider {
  isReady: boolean;
  generatePaymentToken: (cardData: CreditCardData) => Promise<string>;
  getInstallments?: (brand: string, totalInCents: number) => Promise<InstallmentOption[]>;
}

export type PaymentMethodType = 'pix' | 'credit_card';
