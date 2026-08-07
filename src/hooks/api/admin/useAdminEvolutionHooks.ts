import { useQuery } from "@tanstack/react-query";
import { adminEvolutionApi } from "@/services/api/admin/admin-evolution.api";

export function useAdminEvolutionInstances() {
  return useQuery({
    queryKey: ["admin", "evolution-instances"],
    queryFn: adminEvolutionApi.getEvolutionInstances,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
