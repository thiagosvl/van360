import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminUserApi,
  type ListUsersParams,
  type UpdateUserPayload,
  type UpdateSubscriptionPayload,
} from "@/services/api/admin/admin-user.api";
import { toast } from "@/utils/notifications/toast";

const KEYS = {
  stats: ["admin", "stats"] as const,
  users: (params?: ListUsersParams) => ["admin", "users", params] as const,
  userDetails: (id: string) => ["admin", "users", id] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: adminUserApi.getStats,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useAdminUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: KEYS.users(params),
    queryFn: () => adminUserApi.getUsers(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useAdminUserDetails(id: string) {
  return useQuery({
    queryKey: KEYS.userDetails(id),
    queryFn: () => adminUserApi.getUserDetails(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      adminUserApi.updateUser(id, data),
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
      adminUserApi.updateSubscription(id, data),
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

export function useCreateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminUserApi.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useResetPasswordAdmin() {
  return useMutation({
    mutationFn: (id: string) => adminUserApi.resetPassword(id),
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
    mutationFn: (id: string) => adminUserApi.deleteUser(id),
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso.");
      qc.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "admin" &&
          query.queryKey[1] === "users" &&
          typeof query.queryKey[2] !== "string",
      });
    },
    onError: () => {
      toast.error("Erro ao excluir usuário.");
    },
  });
}
