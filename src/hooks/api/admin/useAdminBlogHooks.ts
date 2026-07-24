import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBlogApi, type UpdateBlogPostPayload } from "@/services/api/admin/admin-blog.api";
import { toast } from "@/utils/notifications/toast";

export function useAdminBlogPosts(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["admin", "blog-posts", params],
    queryFn: () => adminBlogApi.getBlogPosts(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useAdminBlogPostDetails(id: string) {
  return useQuery({
    queryKey: ["admin", "blog-posts", id],
    queryFn: () => adminBlogApi.getBlogPostDetails(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminBlogApi.createBlogPost,
    onSuccess: () => {
      toast.success("Artigo criado com sucesso.");
      qc.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
    onError: () => {
      toast.error("Erro ao criar artigo.");
    },
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostPayload }) =>
      adminBlogApi.updateBlogPost(id, data),
    onSuccess: (_, variables) => {
      toast.success("Artigo atualizado com sucesso.");
      qc.invalidateQueries({ queryKey: ["admin", "blog-posts", variables.id] });
      qc.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar artigo.");
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminBlogApi.deleteBlogPost,
    onSuccess: () => {
      toast.success("Artigo excluído com sucesso.");
      qc.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
    onError: () => {
      toast.error("Erro ao excluir artigo.");
    },
  });
}
