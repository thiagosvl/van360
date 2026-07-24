import { useQuery } from "@tanstack/react-query";
import { adminLogApi } from "@/services/api/admin/admin-log.api";

export function useAdminUserLogs(id: string, params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string }) {
  return useQuery({
    queryKey: ["admin", "users", id, "logs", params],
    queryFn: () => adminLogApi.getUserLogs(id, params),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useAdminLogs(params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string; search_cpf?: string }) {
  return useQuery({
    queryKey: ["admin", "logs", params],
    queryFn: () => adminLogApi.getLogs(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
