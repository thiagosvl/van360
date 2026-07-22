import { gastoCategoriaApi, GastoCategoriaResponse } from "@/services/api/gasto-categoria.api";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGastoCategorias(options?: { enabled?: boolean }) {
  const query = useQuery<GastoCategoriaResponse[]>({
    queryKey: ["gasto-categorias"],
    queryFn: async () => {
      const data = await gastoCategoriaApi.listCategorias();
      return data || [];
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutos de stale
    refetchOnWindowFocus: false,
  });

  return query;
}

export function useCreateGastoCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nome: string; cor?: string; icone?: string }) =>
      gastoCategoriaApi.createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gasto-categorias"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Não foi possível criar a categoria", {
        description: getErrorMessage(error, "Verifique se o nome já está em uso."),
      });
    },
  });
}

export function useUpdateGastoCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nome?: string; cor?: string; icone?: string } }) =>
      gastoCategoriaApi.updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gasto-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      toast.success("Categoria atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Não foi possível atualizar a categoria", {
        description: getErrorMessage(error, "Verifique se o nome já está em uso."),
      });
    },
  });
}

export function useDeleteGastoCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gastoCategoriaApi.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gasto-categorias"] });
      toast.success("Categoria excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Não foi possível excluir a categoria", {
        description: getErrorMessage(error, "Verifique suas permissões."),
      });
    },
  });
}
