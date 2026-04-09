import {
  SubscriptionStatus,
  SubscriptionIdentifer,
  SubscriptionInvoiceStatus,
  CheckoutPaymentMethod
} from './enums';

export interface Subscription {
  id: string;
  usuario_id: string;
  plano_id: string;
  status: SubscriptionStatus;
  metodo_pagamento: CheckoutPaymentMethod | null;
  metodo_pagamento_preferencial_id: string | null;
  data_inicio: string;
  data_vencimento: string | null;
  trial_ends_at: string | null;
  gateway_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  planos: SaaSPlan;
}

export interface PlansResponse {
  plans: SaaSPlan[];
  isPromotionActive: boolean;
}

export interface SaaSPlan {
  id: string;
  nome: string;
  identificador: SubscriptionIdentifer;
  valor: number;
  valor_promocional: number | null;
  vantagens?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferralData {
  total: number;
  completed: number;
  pending: number;
  referralCode: string;
  referralLink: string;
}

export interface SubscriptionInvoice {
  id: string;
  assinatura_id: string;
  usuario_id: string;
  plano_id: string;
  metodo_pagamento: CheckoutPaymentMethod;
  status: SubscriptionInvoiceStatus;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  gateway_txid: string | null;
  pix_copy_paste: string | null;
  created_at: string;
  assinaturas?: {
    planos: SaaSPlan;
  };
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last_4_digits: string;
  expire_month: string;
  expire_year: string;
  is_default: boolean;
  created_at: string;
}

export interface PixPaymentData {
  qrcode: string;
  imagem_qrcode: string;
  txid: string;
  valor: number;
  vencimento: string;
}
