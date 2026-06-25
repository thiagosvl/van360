import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type ListUsersParams,
  type UpdateUserPayload,
  type UpdateSubscriptionPayload,
  type UpdatePlanPayload,
  type CreateUserPayload,
} from "@/services/api/admin.api";
import { toast } from "@/utils/notifications/toast";

const KEYS = {
  stats: ["admin", "stats"] as const,
  users: (params?: ListUsersParams) => ["admin", "users", params] as const,
  userDetails: (id: string) => ["admin", "users", id] as const,
  configs: ["admin", "configs"] as const,
  plans: ["admin", "plans"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: adminApi.getStats,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useAdminUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: KEYS.users(params),
    queryFn: () => adminApi.getUsers(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useAdminUserDetails(id: string) {
  return useQuery({
    queryKey: KEYS.userDetails(id),
    queryFn: () => adminApi.getUserDetails(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useAdminUserLogs(id: string, params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string }) {
  return useQuery({
    queryKey: ["admin", "users", id, "logs", params],
    queryFn: () => adminApi.getUserLogs(id, params),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useAdminLogs(params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; acao?: string; entidade?: string; search_cpf?: string }) {
  return useQuery({
    queryKey: ["admin", "logs", params],
    queryFn: () => adminApi.getLogs(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      adminApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success("Cadastro atualizado com sucesso.");
      qc.invalidateQueries({ queryKey: KEYS.userDetails(variables.id) });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar cadastro.");
    },
  });
}

export function useUpdateSubscriptionAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPayload }) =>
      adminApi.updateSubscription(id, data),
    onSuccess: (_, variables) => {
      toast.success("Assinatura atualizada com sucesso.");
      qc.invalidateQueries({ queryKey: KEYS.userDetails(variables.id) });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: KEYS.stats });
    },
    onError: () => {
      toast.error("Erro ao atualizar assinatura.");
    },
  });
}

export function useAdminConfigs() {
  return useQuery({
    queryKey: KEYS.configs,
    queryFn: adminApi.getConfigs,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chave, valor }: { chave: string; valor: string }) =>
      adminApi.updateConfig(chave, valor),
    onSuccess: () => {
      toast.success("Configuração salva com sucesso.");
      qc.invalidateQueries({ queryKey: KEYS.configs });
    },
    onError: () => {
      toast.error("Erro ao salvar configuração.");
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: KEYS.plans,
    queryFn: adminApi.getPlans,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanPayload }) =>
      adminApi.updatePlan(id, data),
    onSuccess: () => {
      toast.success("Preço do plano atualizado com sucesso.");
      qc.invalidateQueries({ queryKey: KEYS.plans });
    },
    onError: () => {
      toast.error("Erro ao salvar preço do plano.");
    },
  });
}

export function useCreateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useResetPasswordAdmin() {
  return useMutation({
    mutationFn: (id: string) => adminApi.resetPassword(id),
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso e enviada ao WhatsApp!");
    },
    onError: () => {
      toast.error("Erro ao redefinir senha do motorista.");
    },
  });
}

export function useDeleteUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso.");
      qc.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === "admin" && 
          query.queryKey[1] === "users" && 
          typeof query.queryKey[2] !== "string"
      });
    },
    onError: () => {
      toast.error("Erro ao excluir usuário.");
    },
  });
}


