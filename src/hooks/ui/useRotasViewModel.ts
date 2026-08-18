import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useRoutes, useExecucoesRota } from "@/hooks/api/useRoutes";
import { useDeleteRoute, useCancelarExecucao, isRecentLocalMutation, debounceRealtimeSync } from "@/hooks/api/useRouteMutations";
import { useLayout } from "@/contexts/LayoutContext";
import { ROUTES } from "@/constants/routes";
import { isMotoristaTitular } from "@/utils/userUtils";
import { toast } from "@/utils/notifications/toast";

export const TAB_MINHAS_ROTAS = "minhas-rotas";
export const TAB_HISTORICO = "historico";

export function useRotasViewModel() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_MINHAS_ROTAS);

  const { openConfirmationDialog, closeConfirmationDialog, openRouteFormDialog } = useLayout();

  const { user } = useSession();
  const { profile, donoContaId } = useProfile(user?.id);
  const usuarioId = donoContaId || user?.id || "";

  const HISTORICO_PAGE_SIZE = 2;
  const [historicoLimit, setHistoricoLimit] = useState(HISTORICO_PAGE_SIZE);

  const { data: rotas = [], isLoading: isLoadingRotas, isFetching: isFetchingRotas, refetch: refetchRotas } = useRoutes(usuarioId, {
    enabled: !!usuarioId && can("rotas.visualizar"),
  });
  const { data: execucoes = [], isLoading: isLoadingExecs, isFetching: isFetchingExecs, refetch: refetchExecs } = useExecucoesRota(
    usuarioId,
    { limit: historicoLimit + 3 },
    { enabled: !!usuarioId && can("rotas.visualizar") }
  );

  const handleLoadMoreHistorico = () => {
    setHistoricoLimit((prev) => prev + HISTORICO_PAGE_SIZE);
  };

  const deleteRouteMutation = useDeleteRoute(usuarioId);
  const cancelarExecucaoMutation = useCancelarExecucao();

  const userVeiculoId = profile?.veiculo_id;
  const isGestor = isMotoristaTitular(profile);

  // Supabase Realtime Sync para a Lista de Rotas
  useEffect(() => {
    const isEventForThisDevice = (payloadData: any) => {
      if (isGestor) return true;
      if (!userVeiculoId) return false;

      const matchesCurrent = payloadData?.veiculoId && payloadData.veiculoId === userVeiculoId;
      const matchesPrevious = payloadData?.previousVeiculoId && payloadData.previousVeiculoId === userVeiculoId;

      if (matchesCurrent || matchesPrevious) return true;
      if (payloadData?.veiculoId || payloadData?.previousVeiculoId) return false;
      return true;
    };

    const triggerRotasSync = () => {
      if (isRecentLocalMutation()) return;
      debounceRealtimeSync("rotas-page-sync", () => {
        queryClient.invalidateQueries({ queryKey: ["routes-list"] });
        queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
      });
    };

    const channel = supabase
      .channel("van360-fleet-sync")
      .on("broadcast", { event: "route_execution_changed" }, (payload: any) => {
        const payloadData = payload?.payload || payload;
        if (isEventForThisDevice(payloadData)) triggerRotasSync();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "rotas_execucao" }, () => {
        triggerRotasSync();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, isGestor, userVeiculoId]);

  const handleOpenCreateRouteDialog = () => {
    openRouteFormDialog({
      onSuccess: (data) => {
        navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_SETUP, {
          state: {
            nome: data.nome,
            veiculoId: data.veiculoId,
            escolaFixaId: data.escolaFixaId,
          },
        });
      },
    });
  };

  const handleDeleteRoute = (id: string, nome: string) => {
    openConfirmationDialog({
      title: "Excluir Rota",
      description: `Tem certeza que deseja excluir a rota "${nome}"? Esta ação não poderá ser desfeita.`,
      confirmText: "Excluir Rota",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteRouteMutation.mutateAsync(id);
          closeConfirmationDialog();
        } catch (error: any) {
          closeConfirmationDialog();
          toast.error(error.message || "Erro ao excluir rota.");
        }
      },
    });
  };

  const handleCancelarExecucao = (execucaoId: string) => {
    openConfirmationDialog({
      title: "Cancelar Execução?",
      description: "Deseja realmente cancelar o andamento desta rota?",
      confirmText: "Sim, Cancelar Rota",
      cancelText: "Voltar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await cancelarExecucaoMutation.mutateAsync(execucaoId);
          closeConfirmationDialog();
          toast.success("Execução cancelada.");
        } catch (error: any) {
          closeConfirmationDialog();
          toast.error(error.message || "Erro ao cancelar execução.");
        }
      },
    });
  };

  const handleRefresh = async () => {
    await Promise.all([refetchRotas(), refetchExecs()]);
  };

  return {
    can,
    navigate,
    activeTab,
    setActiveTab,
    rotas,
    execucoes,
    isLoading: isLoadingRotas || isLoadingExecs,
    isFetching: isFetchingRotas || isFetchingExecs,
    isGestor,
    handleOpenCreateRouteDialog,
    handleDeleteRoute,
    handleCancelarExecucao,
    handleRefresh,
    historicoLimit,
    handleLoadMoreHistorico,
  };
}
