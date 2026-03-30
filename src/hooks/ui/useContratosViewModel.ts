import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useContratos,
  useContratosKPIs,
  useCreateContrato,
  useDeleteContrato,
  usePreviewContrato,
  useReenviarContrato,
  useSubstituirContrato,
} from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useFilters } from "@/hooks/ui/useFilters";
import { ContratoTab } from "@/types/enums";
import { openBrowserLink } from "@/utils/browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { usuarioApi } from "@/services/api/usuario.api";
import { queryClient } from "@/services/queryClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function useContratosViewModel() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openContractSetupDialog } = useLayout();
  const { user } = useSession();
  const { profile, isLoading: isProfileLoading, refreshProfile } = useProfile(user?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const pdfUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        window.URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  // Sync Page Title
  useEffect(() => {
    setPageTitle("Contratos");
  }, [setPageTitle]);

  // Filtros e Abas
  const {
    searchTerm: busca,
    setSearchTerm: setBusca,
    hasActiveFilters,
    setFilters
  } = useFilters({
    searchParam: "search",
  });

  const activeTab = (searchParams.get("tab") as ContratoTab) || ContratoTab.PENDENTES;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(busca), 500);
    return () => clearTimeout(handler);
  }, [busca]);

  const handleTabChange = useCallback((val: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", val);
      return newParams;
    });
  }, [setSearchParams]);

  // Queries e Mutations
  const { data: kpis, isLoading: isLoadingKPIs, refetch: refetchKPIs } = useContratosKPIs();

  const { data: contratosRes, isLoading: isLoadingContratos, refetch: refetchContratos } = useContratos(
    { tab: activeTab, search: debouncedSearch }
  );

  const deleteMutation = useDeleteContrato();
  const reenviarMutation = useReenviarContrato();
  const substituirMutation = useSubstituirContrato();
  const createMutation = useCreateContrato();
  const previewMutation = usePreviewContrato();

  const handleRefresh = async () => {
    await Promise.all([refetchKPIs(), refetchContratos()]);
  };

  const isContratoAtivo = !!profile?.config_contrato?.usar_contratos;

  const handleOpenContractSetup = useCallback(() => {
    openContractSetupDialog({
      forceOpen: true,
      skipWelcome: true,
      onSuccess: (usarContratos) => {
        if (usarContratos) {
          refetchKPIs();
          refetchContratos();
        }
      }
    });
  }, [openContractSetupDialog, refetchKPIs, refetchContratos]);

  const handleToggleContracts = useCallback(async (active: boolean) => {
    if (!profile?.id) return;

    openConfirmationDialog({
      title: active ? "Ativar Contratos?" : "Desativar Contratos?",
      description: active
        ? "Tem certeza que deseja ativar a geração de contratos para sua van? Você poderá configurar as regras e modelos."
        : "Tem certeza que deseja desativar a geração de contratos? Os contratos existentes continuarão valendo, mas novos contratos não serão gerados automaticamente.",
      confirmText: active ? "Ativar" : "Desativar",
      variant: active ? "default" : "destructive",
      onConfirm: async () => {
        setIsToggling(true);
        try {
          await usuarioApi.atualizarUsuario(profile.id!, {
            config_contrato: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(profile.config_contrato as any || {}),
              usar_contratos: active,
            }
          });
          refreshProfile();
          await Promise.all([refetchKPIs(), refetchContratos()]);
          toast.success(active ? "Contratos ativados com sucesso!" : "Geração automática desativada.");
        } catch (err) {
          toast.error("Erro ao alterar o status do contrato.");
        } finally {
          setIsToggling(false);
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  }, [profile, refetchKPIs, refetchContratos, openConfirmationDialog, closeConfirmationDialog, refreshProfile]);

  const handleActivateContracts = useCallback(() => {
    openContractSetupDialog({
      skipWelcome: true,
      onSuccess: (usarContratos) => {
        if (usarContratos) {
          refreshProfile();
          refetchKPIs();
          refetchContratos();
        }
      }
    });
  }, [openContractSetupDialog, refreshProfile, refetchKPIs, refetchContratos]);

  const handleVerPassageiro = useCallback((id: string) => {
    navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", id));
  }, [navigate]);

  const handleCopiarLink = useCallback((token: string) => {
    const url = `${window.location.origin}/assinar/${token}`;
    navigator.clipboard.writeText(url);
  }, []);

  const handleVisualizarLink = useCallback((token: string) => {
    openBrowserLink(`${window.location.origin}/assinar/${token}`);
  }, []);

  const handleVisualizarFinal = useCallback((url: string) => {
    openBrowserLink(url);
  }, []);

  const handleExcluir = useCallback((id: string) => {
    openConfirmationDialog({
      title: "Excluir Contrato?",
      description: "Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, deleteMutation, closeConfirmationDialog]);

  const handleSubstituir = useCallback((id: string) => {
    openConfirmationDialog({
      title: "Substituir Contrato?",
      description: "O contrato atual será marcado como substituído e um novo será gerado com os dados atuais do passageiro. Deseja continuar?",
      confirmText: "Continuar",
      onConfirm: async () => {
        await substituirMutation.mutateAsync(id);
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, substituirMutation, closeConfirmationDialog]);

  const handleGerarContrato = useCallback((passageiroId: string) => {
    openConfirmationDialog({
      title: "Gerar Contrato?",
      description: "Deseja gerar o contrato? O responsável receberá o link para assinatura.",
      confirmText: "Gerar",
      onConfirm: async () => {
        await createMutation.mutateAsync({ passageiroId });
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, createMutation, closeConfirmationDialog]);

  const handleOpenPreview = useCallback(async () => {
    if (!isContratoAtivo) {
      toast.error("Ative a funcionalidade de contratos para visualizar o modelo");
      return;
    }

    try {
      const result = await previewMutation.mutateAsync({});

      if (pdfUrlRef.current) {
        window.URL.revokeObjectURL(pdfUrlRef.current);
      }

      pdfUrlRef.current = result.url;
      setPdfUrl(result.url);
      setIsPreviewPdfOpen(true);
    } catch (err) {
      // Handled by mutation
    }
  }, [isContratoAtivo, previewMutation]);

  const isActionLoading =
    deleteMutation.isPending ||
    reenviarMutation.isPending ||
    substituirMutation.isPending ||
    createMutation.isPending ||
    previewMutation.isPending;

  return {
    profile,
    isProfileLoading,
    activeTab,
    busca,
    setBusca,
    debouncedSearch,
    handleTabChange,
    kpis,
    contratos: contratosRes?.list || [],
    isLoading: isLoadingContratos || isLoadingKPIs,
    isActionLoading,
    isContratoAtivo,
    handleRefresh,
    handleOpenContractSetup,
    handleActivateContracts,
    handleToggleContracts,
    isToggling,
    handleOpenPreview,
    isPreviewLoading: previewMutation.isPending,
    isPreviewPdfOpen,
    setIsPreviewPdfOpen,
    pdfUrl,
    hasActiveFilters,
    setFilters,
    actions: {
      onVerPassageiro: handleVerPassageiro,
      onCopiarLink: handleCopiarLink,
      onReenviarNotificacao: (id: string) => reenviarMutation.mutate(id),
      onExcluir: handleExcluir,
      onSubstituir: handleSubstituir,
      onGerarContrato: handleGerarContrato,
      onVisualizarLink: handleVisualizarLink,
      onVisualizarFinal: handleVisualizarFinal,
    }
  };
}
