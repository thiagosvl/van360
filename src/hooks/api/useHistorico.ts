import { historicoApi } from "@/services/api/historico.api";
import { AtividadeEntidadeTipo } from "@/types/enums";
import { Atividade } from "@/types/historico";
import { useQuery } from "@tanstack/react-query";

export function useHistoricoByEntidade(entidadeTipo: AtividadeEntidadeTipo | string, entidadeId: string, options?: { enabled?: boolean }) {
  return useQuery<Atividade[]>({
    queryKey: ["historico", entidadeTipo, entidadeId],
    queryFn: () => historicoApi.listByEntidade(entidadeTipo, entidadeId),
    enabled: options?.enabled ?? (!!entidadeTipo && !!entidadeId),
    staleTime: 1000 * 30, // 30 segundos
  });
}

export function useHistoricoByUsuario(usuarioId: string, options?: { enabled?: boolean }) {
  return useQuery<Atividade[]>({
    queryKey: ["historico", "usuario", usuarioId],
    queryFn: () => historicoApi.listByUsuario(usuarioId),
    enabled: options?.enabled ?? !!usuarioId,
    staleTime: 1000 * 30,
  });
}
