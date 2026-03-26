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
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ContratoTab } from "@/types/enums";
import { openBrowserLink } from "@/utils/browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function useContratosViewModel() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openContractSetupDialog } = useLayout();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
  const activeTab = (searchParams.get("tab") as ContratoTab) || ContratoTab.PENDENTES;
  const [busca, setBusca] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(busca), 500);
    return () => clearTimeout(handler);
  }, [busca]);

  const handleTabChange = useCallback((val: string) => {
    setSearchParams({ tab: val });
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

  const handleOpenContractSetup = useCallback(() => {
    openContractSetupDialog({
        forceOpen: true,
        onSuccess: (usarContratos) => {
            if (usarContratos) {
                refetchKPIs();
                refetchContratos();
            }
        }
    });
  }, [openContractSetupDialog, refetchKPIs, refetchContratos]);

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
      description: "Deseja gerar um novo contrato para este passageiro agora?",
      confirmText: "Gerar",
      onConfirm: async () => {
        await createMutation.mutateAsync({ passageiroId });
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, createMutation, closeConfirmationDialog]);

  const handleOpenPreview = useCallback(async () => {
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
  }, [previewMutation]);

  const isActionLoading = 
    deleteMutation.isPending || 
    reenviarMutation.isPending || 
    substituirMutation.isPending ||
    createMutation.isPending ||
    previewMutation.isPending;

  const isContratoAtivo = !!profile?.config_contrato?.usar_contratos;

  return {
    profile,
    isProfileLoading,
    activeTab,
    busca,
    setBusca,
    debouncedSearch,
    handleTabChange,
    kpis,
    contratos: contratosRes?.data || [],
    isLoading: isLoadingContratos || isLoadingKPIs,
    isActionLoading,
    isContratoAtivo,
    handleRefresh,
    handleOpenContractSetup,
    handleOpenPreview,
    isPreviewPdfOpen,
    setIsPreviewPdfOpen,
    pdfUrl,
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
