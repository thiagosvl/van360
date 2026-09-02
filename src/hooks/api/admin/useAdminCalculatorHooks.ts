import { useQuery } from "@tanstack/react-query";
import { adminCalculatorApi } from "@/services/api/admin/admin-calculator.api";

const KEYS = {
  baseline: ["admin", "calculator", "baseline"] as const,
};

export function useAdminCalculatorBaseline() {
  return useQuery({
    queryKey: KEYS.baseline,
    queryFn: adminCalculatorApi.getBaseline,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
