import { useQuery } from "@tanstack/react-query";
import { veiculoApi } from "@/services/api/veiculo.api";
import { Veiculo } from "@/types/veiculo";

export function useVeiculos(
  usuarioId?: string,
  options?: {
    enabled?: boolean;
    onError?: (error: unknown) => void;
  }
) {
  return useQuery({
    queryKey: ["veiculos", usuarioId],
    enabled: (options?.enabled ?? true) && Boolean(usuarioId),
    keepPreviousData: true,
    // Considera os dados stale imediatamente para garantir refetch quando necessário
    staleTime: 0,
    // Sempre refetch quando o componente montar para garantir dados atualizados
    refetchOnMount: "always",
    // Refetch quando a janela ganhar foco para garantir dados atualizados
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!usuarioId) return [];

      const data = await veiculoApi.listVeiculosComContagemAtivos(usuarioId);
      return (data as (Veiculo & { passageiros_ativos_count?: number })[]) ?? [];
    },
    select: (veiculos): {
      list: (Veiculo & { passageiros_ativos_count?: number })[];
      total: number;
      ativos: number;
    } => {
      const list = veiculos ?? [];
      const ativos = list.filter((veiculo) => veiculo.ativo).length;

      return {
        list,
        total: list.length,
        ativos,
      };
    },
    onError: options?.onError,
  });
}

