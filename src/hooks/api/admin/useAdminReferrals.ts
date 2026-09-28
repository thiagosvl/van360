import { useQuery } from "@tanstack/react-query";
import { adminUserApi, type ListReferralsParams } from "@/services/api/admin/admin-user.api";

export function useAdminReferrals(params?: ListReferralsParams) {
  return useQuery({
    queryKey: ["admin", "referrals", params],
    queryFn: () => adminUserApi.listReferrals(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}
