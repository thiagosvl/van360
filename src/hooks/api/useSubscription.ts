import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/services/api/subscription.api";
import {
  Subscription,
  SaaSPlan,
  ReferralData,
  SubscriptionInvoice,
  PaymentMethod,
  PlansResponse,
} from "@/types/subscription";
import {
  SubscriptionStatus,
} from "@/types/enums";


import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Bundle de queries relacionadas à assinatura que devem ser invalidadas juntas para manter consistência
const SUBSCRIPTION_QUERY_BUNDLE = (userId: string) => [
  ["subscription", userId],
  ["subscription-invoices", userId],
  ["payment-methods", userId],
  ["usuario-resumo"]
];

// Gerenciamento centralizado de canais de Realtime para evitar conexões duplicadas
const activeChannels: Record<string, { channel: any; subscribers: number }> = {};

// Helper para invalidar queries com debounce para evitar loop de requisições em atualizações múltiplas
let invalidationTimeout: NodeJS.Timeout | null = null;
const debouncedInvalidate = (queryClient: any, userId: string) => {
  if (invalidationTimeout) clearTimeout(invalidationTimeout);
  invalidationTimeout = setTimeout(() => {
    const keys = SUBSCRIPTION_QUERY_BUNDLE(userId);

    // Invalidamos as queries de forma conservadora.
    // Usamos refetchType: 'active' para que a UI atualize conforme o Realtime,
    // mas o debounce de 3s garante que mudanças rápidas no DB (assinatura + fatura)
    // disparem apenas uma rodada de requisições.
    keys.forEach(key => {
      queryClient.invalidateQueries({
        queryKey: key,
        refetchType: 'active'
      });
    });
  }, 3000); // 3s para garantir consolidação de eventos de múltiplas tabelas
};

export const useSubscriptionStatus = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<Subscription>({
    queryKey: ["subscription", userId],
    queryFn: () => subscriptionApi.getSubscription(),
    enabled: !!userId,
    staleTime: 120000, // 2 minutos de staleTime para evitar refetches ansiosos no re-render
    refetchInterval: (query) => {
      const data = query.state.data as Subscription | undefined;
      return data?.status === SubscriptionStatus.PAST_DUE ? 60000 : 300000;
    },
    refetchOnWindowFocus: false,
  });

  // Realtime subscription updates com controle de Single Source
  useEffect(() => {
    if (!userId) return;

    if (!activeChannels[userId]) {
      const channel = supabase
        .channel(`subscription-changes-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "assinaturas",
            filter: `usuario_id=eq.${userId}`,
          },
          () => {
            debouncedInvalidate(queryClient, userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "assinatura_faturas",
            filter: `usuario_id=eq.${userId}`,
          },
          () => {
            debouncedInvalidate(queryClient, userId);
          }
        )
        .subscribe();

      activeChannels[userId] = { channel, subscribers: 1 };
    } else {
      activeChannels[userId].subscribers++;
    }

    return () => {
      if (activeChannels[userId]) {
        activeChannels[userId].subscribers--;
        if (activeChannels[userId].subscribers <= 0) {
          supabase.removeChannel(activeChannels[userId].channel);
          delete activeChannels[userId];
        }
      }
    };
  }, [userId, queryClient]);

  return {
    subscription: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    isError: query.isError,
  };
};

export const useSubscriptionPlans = () => {
  const query = useQuery<PlansResponse>({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionApi.getPlans(),
    staleTime: 1000 * 60 * 60, // Plans don't change often (1 hour)
  });

  return {
    plans: query.data?.plans,
    isPromotionActive: query.data?.isPromotionActive ?? false,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useSubscriptionBilling = (userId?: string) => {
  const queryClient = useQueryClient();

  const paymentMethodsQuery = useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods", userId],
    queryFn: () => subscriptionApi.listPaymentMethods(),
    enabled: !!userId,
  });

  const invoicesQuery = useQuery<SubscriptionInvoice[]>({
    queryKey: ["subscription-invoices", userId],
    queryFn: () => subscriptionApi.getInvoices(),
    enabled: !!userId,
    staleTime: 120000,
    refetchOnWindowFocus: false,
  });

  const setDefaultPaymentMethod = useMutation({
    mutationFn: (id: string) => subscriptionApi.setDefaultPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: (id: string) => subscriptionApi.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });

  return {
    paymentMethods: paymentMethodsQuery.data,
    isLoadingPaymentMethods: paymentMethodsQuery.isLoading,
    invoices: invoicesQuery.data,
    isLoadingInvoices: invoicesQuery.isLoading,
    refetchInvoices: invoicesQuery.refetch,
    setDefaultPaymentMethod,
    deletePaymentMethod,
  };
};

export const useSubscriptionReferral = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<ReferralData>({
    queryKey: ["referral-link", userId],
    queryFn: () => subscriptionApi.getReferralLink(),
    enabled: !!userId,
  });

  const claimReferral = useMutation({
    mutationFn: (phone: string) => subscriptionApi.claimReferral(phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-link"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  return {
    referral: query.data,
    isLoading: query.isLoading,
    claimReferral,
  };
};

export const useSubscriptionCheckout = () => {
  const queryClient = useQueryClient();

  const createCheckout = useMutation({
    mutationFn: (data: Parameters<typeof subscriptionApi.createCheckout>[0]) =>
      subscriptionApi.createCheckout(data),
    onSuccess: () => {
      // Nota: Não invalidamos aqui para evitar burst imediato ao gerar checkout.
      // O Realtime ou o próprio retorno da mutation cuidarão da atualização visual.
    },
  });

  return {
    createCheckout,
    checkPixStatus: (txid: string) => subscriptionApi.checkPixStatus(txid),
  };
};

