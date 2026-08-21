import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/services/api/subscription.api";
import {
  Subscription,
  SaaSPlan,
  ReferralData,
  SubscriptionInvoice,
  PaymentMethod,
  PlansResponse,
  ListSubscriptionInvoicesResponse,
} from "@/types/subscription";
import {
  SubscriptionStatus,
} from "@/types/enums";


import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const activeChannels: Record<string, { channel: ReturnType<typeof supabase.channel>; subscribers: number }> = {};
const pendingInvalidations: Record<string, { timeout: NodeJS.Timeout | null; keys: Set<string> }> = {};

const scheduleQueryInvalidation = (queryClient: ReturnType<typeof useQueryClient>, userId: string, queryKeys: string[][]) => {
  if (!pendingInvalidations[userId]) {
    pendingInvalidations[userId] = { timeout: null, keys: new Set() };
  }

  const tracker = pendingInvalidations[userId];
  queryKeys.forEach(k => tracker.keys.add(JSON.stringify(k)));

  if (tracker.timeout) clearTimeout(tracker.timeout);

  tracker.timeout = setTimeout(() => {
    tracker.keys.forEach(kStr => {
      queryClient.invalidateQueries({
        queryKey: JSON.parse(kStr)
      });
    });
    delete pendingInvalidations[userId];
  }, 900);
};

export const useSubscriptionStatus = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<Subscription>({
    queryKey: ["subscription", userId],
    queryFn: () => subscriptionApi.getSubscription(),
    enabled: !!userId,
    staleTime: 120000,
    refetchInterval: (query) => {
      const data = query.state.data as Subscription | undefined;
      return data?.status === SubscriptionStatus.PAST_DUE ? 60000 : 300000;
    },
    refetchOnWindowFocus: 'always',
  });

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
            scheduleQueryInvalidation(queryClient, userId, [
              ["subscription", userId],
              ["usuario-resumo"]
            ]);
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
            scheduleQueryInvalidation(queryClient, userId, [
              ["subscription-invoices", userId],
              ["subscription-invoices-paginated", userId]
            ]);
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

export const useSubscriptionPlans = (options?: { enabled?: boolean }) => {
  const query = useQuery<PlansResponse>({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionApi.getPlans(),
    enabled: options?.enabled ?? true,
    staleTime: 0, // Sempre re-busca para garantir preços atualizados (útil no alt-tab)
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

  const invoicesQuery = useQuery({
    queryKey: ["subscription-invoices", userId],
    queryFn: () => subscriptionApi.getInvoices(),
    enabled: !!userId,
    staleTime: 120000,
    refetchOnWindowFocus: 'always',
    select: (data) => {
      if (Array.isArray(data)) {
        return { list: data as SubscriptionInvoice[], total: (data as SubscriptionInvoice[]).length };
      }
      return {
        list: data?.list || [],
        total: data?.total || 0,
      };
    },
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
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  return {
    paymentMethods: paymentMethodsQuery.data,
    isLoadingPaymentMethods: paymentMethodsQuery.isLoading,
    invoices: invoicesQuery.data?.list,
    totalInvoices: invoicesQuery.data?.total ?? 0,
    isLoadingInvoices: invoicesQuery.isLoading,
    refetchInvoices: invoicesQuery.refetch,
    setDefaultPaymentMethod,
    deletePaymentMethod,
  };
};

export const useSubscriptionInvoicesPaginated = (params: {
  userId?: string;
  page: number;
  limit: number;
  enabled?: boolean;
}) => {
  return useQuery<ListSubscriptionInvoicesResponse>({
    queryKey: ["subscription-invoices-paginated", params.userId, params.page, params.limit],
    queryFn: () => subscriptionApi.getInvoices({ page: params.page, limit: params.limit }),
    enabled: !!params.userId && (params.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
};

export const useSubscriptionReferral = (userId?: string) => {
  const query = useQuery<ReferralData>({
    queryKey: ["referral-link", userId],
    queryFn: () => subscriptionApi.getReferralLink(),
    enabled: !!userId,
  });

  return {
    referral: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useSubscriptionCheckout = () => {
  const createCheckout = useMutation({
    mutationFn: (data: Parameters<typeof subscriptionApi.createCheckout>[0]) =>
      subscriptionApi.createCheckout(data),
  });

  return {
    createCheckout,
    checkPixStatus: (txid: string) => subscriptionApi.checkPixStatus(txid),
  };
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-invoices-paginated"] });
    },
  });
};

