import { apiClient } from "./client";
import { SaaSPlan, Subscription, ReferralData, SubscriptionInvoice, PaymentMethod, PlansResponse } from "@/types/subscription";

const endpointBase = "/subscriptions";

export const subscriptionApi = {
  getSubscription: (): Promise<Subscription> =>
    apiClient.get(`${endpointBase}/status`).then((res) => res.data),

  getPlans: (): Promise<PlansResponse> =>
    apiClient.get(`${endpointBase}/plans`).then((res) => res.data),

  createCheckout: (data: {
    planId: string;
    paymentMethod: "pix" | "credit_card";
    paymentToken?: string;
    savedCardId?: string;
    saveCard?: boolean;
    cardBrand?: string;
    cardLast4?: string;
    expireMonth?: string;
    expireYear?: string;
    birth?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    zipcode?: string;
    city?: string;
    state?: string;
  }) =>
    apiClient.post(`${endpointBase}/checkout`, { ...data }).then((res) => res.data),

  getReferralLink: (): Promise<ReferralData> =>
    apiClient.get(`${endpointBase}/referral`).then((res) => res.data),

  claimReferral: (phone: string) =>
    apiClient.post(`${endpointBase}/referral/claim`, { phone }).then((res) => res.data),

  checkPixStatus: (txid: string) =>
    apiClient.get(`${endpointBase}/pix/status/${txid}`).then((res) => res.data),

  listPaymentMethods: (): Promise<PaymentMethod[]> =>
    apiClient.get(`${endpointBase}/payment-methods`).then((res) => res.data),

  deletePaymentMethod: (id: string) =>
    apiClient.delete(`${endpointBase}/payment-methods/${id}`).then((res) => res.data),

  setDefaultPaymentMethod: (id: string) =>
    apiClient.put(`${endpointBase}/payment-methods/${id}/default`).then((res) => res.data),

  getInvoices: (): Promise<SubscriptionInvoice[]> =>
    apiClient.get(`${endpointBase}/invoices`).then((res) => res.data),
};
