import { useQuery } from "@tanstack/react-query";
import { adminFinancialApi } from "@/services/api/admin/admin-financial.api";

export const FINANCIAL_KEYS = {
  stats: ["admin", "stats", "financial"] as const,
  demographics: ["admin", "stats", "demographics"] as const,
};

export function useAdminFinancialStats() {
  return useQuery({
    queryKey: FINANCIAL_KEYS.stats,
    queryFn: adminFinancialApi.getFinancialStats,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAdminDemographicsStats() {
  return useQuery({
    queryKey: FINANCIAL_KEYS.demographics,
    queryFn: adminFinancialApi.getDemographicsStats,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
