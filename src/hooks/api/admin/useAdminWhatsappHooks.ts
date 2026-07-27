import { useQuery } from "@tanstack/react-query";
import { adminWhatsappApi } from "@/services/api/admin/admin-whatsapp.api";

export function useAdminWhatsappInstances() {
  return useQuery({
    queryKey: ["admin", "whatsapp-instances"],
    queryFn: adminWhatsappApi.getWhatsappInstances,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
