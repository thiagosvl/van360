import { ROUTES } from "@/constants/routes";
import { BASE_DOMAIN } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  obterStatusConfiguracaoContrato,
  StatusConfiguracaoContrato,
  obterUrlDocumentoContrato,
  gerarNomeArquivoContrato,
  shareContratoFile,
} from "@/utils/domain";
import {
  useContratos,
  useContratosKPIs,
  useCreateContrato,
  useDeleteContrato,
  usePreviewContrato,
  useSubstituirContrato,
  useDownloadContrato,
} from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useFilters } from "@/hooks/ui/useFilters";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { buildContratoWhatsAppUrl } from "@/utils/whatsappTemplates";
import { ContratoStatus, ContratoTab, PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { ContratoListItem } from "@/types/contract";
import { openBrowserLink } from "@/utils/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usuarioApi } from "@/services/api/usuario.api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function useContratosViewModel() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openContractSetupDialog,
    openGerarContratoValidadorDialog,
    openImportarContratoDialog,
    openPassageiroFormDialog,
  } = useLayout();
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

  const rawTab = searchParams.get("tab");
  const activeTab =
    rawTab === ContratoTab.PENDENTES
      ? ContratoTab.PENDENTES
      : rawTab === ContratoTab.ASSINADOS
        ? ContratoTab.ASSINADOS
        : ContratoTab.SEM_CONTRATO;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(busca), 500);
    return () => clearTimeout(handler);
  }, [busca]);

  const contratosFilters = useMemo(
    () => ({ tab: activeTab, search: debouncedSearch }),
    [activeTab, debouncedSearch]
  );

  const { data: kpis, isLoading: isLoadingKPIs, refetch: refetchKPIs } = useContratosKPIs({
    enabled: !!profile?.id && (can("contratos.gerenciar") || can("financeiro.visualizar")),
  });

  const { data: contratosRes, isLoading: isLoadingContratos, refetch: refetchContratos } = useContratos(
    contratosFilters,
    { enabled: !!profile?.id && (can("contratos.gerenciar") || can("financeiro.visualizar")) }
  );

  const handleTabChange = useCallback((val: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", val);
      return newParams;
    });
    refetchKPIs();
  }, [setSearchParams, refetchKPIs]);

  const deleteMutation = useDeleteContrato();
  const substituirMutation = useSubstituirContrato();
  const createMutation = useCreateContrato();
  const previewMutation = usePreviewContrato();
  const downloadMutation = useDownloadContrato();

  const handleRefresh = async () => {
    await Promise.all([refetchKPIs(), refetchContratos()]);
  };

  const statusConfig = obterStatusConfiguracaoContrato(profile);
  const isContratoConfigurado = statusConfig !== StatusConfiguracaoContrato.NAO_CONFIGURADO;
  const isContratoAtivo = statusConfig === StatusConfiguracaoContrato.ATIVO;

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

  const handleToggleContracts = useCallback(async (active: boolean) => {
    if (!profile?.id) return;

    if (active && !profile.assinatura_digital_url) {
      openContractSetupDialog({
        onSuccess: (usarContratos) => {
          if (usarContratos) {
            refreshProfile();
            refetchKPIs();
            refetchContratos();
          }
        }
      });
      return;
    }

    openConfirmationDialog({
      title: active ? "Reativar Uso de Contratos?" : "Desativar Uso de Contratos?",
      description: active
        ? "Tem certeza que deseja reativar o uso de contratos? Você poderá gerar e gerenciar contratos em PDF para os alunos com as configurações salvas anteriormente."
        : "Tem certeza que deseja desativar a funcionalidade de contratos? Os contratos existentes continuarão valendo, mas novos contratos não poderão ser emitidos.",
      confirmText: active ? "Reativar" : "Desativar",
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
          toast.success(active ? "Uso de contratos reativado com sucesso!" : "Uso de contratos desativado.");
        } catch (err) {
          toast.error("Erro ao alterar o status do contrato.");
        } finally {
          setIsToggling(false);
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  }, [profile, refetchKPIs, refetchContratos, openConfirmationDialog, closeConfirmationDialog, refreshProfile, openContractSetupDialog]);

  const handleActivateContracts = useCallback(() => {
    openContractSetupDialog({
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
    const url = `${BASE_DOMAIN}/assinar/${token}`;
    navigator.clipboard.writeText(url);
  }, []);

  const handleVisualizarLink = useCallback((token: string) => {
    openBrowserLink(`${BASE_DOMAIN}/assinar/${token}`);
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

  const isMobile = useIsMobile();
  const handleEnviarWhatsApp = useCallback((item: any) => {
    // Para contratos pendentes, sempre usamos o link do portal de assinatura
    const token = item.token_acesso || item.id;
    const finalLink = `${BASE_DOMAIN}/assinar/${token}`;

    if (!isMobile) {
      navigator.clipboard.writeText(finalLink);
      toast.success("Link para assinatura copiado!");
      return;
    }

    const respObj = item.passageiro?.responsavel_principal || item.responsavel_principal;
    const telefone = respObj?.telefone || item.dados_contrato?.telefoneResponsavel;

    if (!telefone) {
      toast.error("Telefone do responsável inválido ou não informado.");
      return;
    }

    const url = buildContratoWhatsAppUrl({
      telefoneResponsavel: telefone,
      nomeResponsavel: respObj?.nome || "",
      nomePassageiro: item.passageiro?.nome || item.nome || "",
      link: finalLink,
    });

    openBrowserLink(url);
  }, [isMobile, openBrowserLink]);

  const handleSubstituir = useCallback((id: string) => {
    openConfirmationDialog({
      title: "Substituir contrato?",
      description: "O contrato atual será marcado como substituído e um novo será gerado com os dados atuais do aluno. O responsável receberá o link para assinatura. Deseja continuar?",
      confirmText: "Substituir",
      cancelText: "Manter atual",
      onConfirm: async () => {
        await substituirMutation.mutateAsync(id);
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, substituirMutation, closeConfirmationDialog]);

  const handleGerarContrato = useCallback((passageiroId: string, item?: ContratoListItem) => {
    const rawPassageiro = (item?.passageiro || (item?.tipo === "passageiro" ? item : null)) as unknown as Passageiro | undefined;

    if (rawPassageiro) {
      queryClient.setQueryData(["passageiro", passageiroId], (old: unknown) => old || rawPassageiro);
    }

    const hasNomeResp = !!(rawPassageiro?.responsavel_principal?.nome);
    const hasCpf = !!(rawPassageiro?.responsavel_principal?.cpf);
    const hasInicio = !!(rawPassageiro?.data_inicio_transporte);
    const hasFim = !!(rawPassageiro?.data_fim_transporte);

    if (rawPassageiro && hasNomeResp && hasCpf && hasInicio && hasFim) {
      const firstName = rawPassageiro.nome?.trim().split(" ")[0] || "o aluno";
      openConfirmationDialog({
        title: "Gerar Contrato?",
        description: `Deseja gerar o contrato para ${firstName}? O responsável receberá o link para assinatura.`,
        confirmText: "Gerar",
        onConfirm: async () => {
          await createMutation.mutateAsync({
            passageiroId,
            valorMensal: Number(rawPassageiro.valor_cobranca || item?.dados_contrato?.valorMensal) || undefined,
            diaVencimento: Number(rawPassageiro.dia_vencimento || item?.dados_contrato?.diaVencimento) || undefined,
          });
          safeCloseDialog(closeConfirmationDialog);
        }
      });
      return;
    }

    openGerarContratoValidadorDialog({
      passageiroId,
      initialPassageiro: rawPassageiro,
      onSuccess: (id, bypassed) => {
        if (bypassed) {
          const firstName = rawPassageiro?.nome?.trim().split(" ")[0] || "o aluno";
          openConfirmationDialog({
            title: "Gerar Contrato?",
            description: `Deseja gerar o contrato para ${firstName}? O responsável receberá o link para assinatura.`,
            confirmText: "Gerar",
            onConfirm: async () => {
              await createMutation.mutateAsync({
                passageiroId: id,
                valorMensal: Number(rawPassageiro?.valor_cobranca || item?.dados_contrato?.valorMensal) || undefined,
                diaVencimento: Number(rawPassageiro?.dia_vencimento || item?.dados_contrato?.diaVencimento) || undefined,
              });
              safeCloseDialog(closeConfirmationDialog);
            }
          });
        } else {
          createMutation.mutateAsync({
            passageiroId: id,
            valorMensal: Number(rawPassageiro?.valor_cobranca || item?.dados_contrato?.valorMensal) || undefined,
            diaVencimento: Number(rawPassageiro?.dia_vencimento || item?.dados_contrato?.diaVencimento) || undefined,
          });
        }
      }
    });
  }, [openGerarContratoValidadorDialog, openConfirmationDialog, createMutation, closeConfirmationDialog, queryClient]);

  const handleCompletarCadastro = useCallback((passageiroId: string, item?: ContratoListItem) => {
    const passageiroData = ((item?.passageiro || item) as unknown as Passageiro) || ({ id: passageiroId } as Passageiro);

    openPassageiroFormDialog({
      mode: PassageiroFormModes.EDIT,
      editingPassageiro: passageiroData,
      onSuccess: (updated) => {
        if (updated) {
          queryClient.setQueryData(["passageiro", passageiroId], updated);
        }
        refetchContratos();
        refetchKPIs();
        handleGerarContrato(passageiroId);
      }
    });
  }, [openPassageiroFormDialog, queryClient, refetchContratos, refetchKPIs, handleGerarContrato]);

  const handleOpenImportarContrato = useCallback((passageiroId?: string, passageiro?: Passageiro | ContratoListItem) => {
    openImportarContratoDialog({
      passageiroId,
      passageiro: passageiro as unknown as Passageiro,
    });
  }, [openImportarContratoDialog]);

  const handleOpenPreview = useCallback(async () => {
    if (!isContratoConfigurado) {
      toast.error("Configure os contratos primeiro para visualizar o modelo");
      return;
    }

    setIsPreviewPdfOpen(true);
    setPdfUrl(null);

    try {
      const result = await previewMutation.mutateAsync({});

      if (pdfUrlRef.current) {
        window.URL.revokeObjectURL(pdfUrlRef.current);
      }

      pdfUrlRef.current = result.url;
      setPdfUrl(result.url);
    } catch {
      setIsPreviewPdfOpen(false);
    }
  }, [isContratoConfigurado, previewMutation]);

  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownloadContrato = useCallback(
    async (item: ContratoListItem) => {
      const status = (item.status || item.status_contrato)?.toString().toLowerCase();
      if (status !== ContratoStatus.ASSINADO) {
        toast.error("O download do documento só está disponível para contratos assinados.");
        return;
      }

      const urlContrato = obterUrlDocumentoContrato(item);
      const targetId = item.id || item.contrato_id;
      if (!urlContrato && !targetId) {
        toast.error("Documento do contrato não encontrado.");
        return;
      }

      const nomeAluno = item.passageiro?.nome || item.nome || "";
      const ano = (item.dados_contrato?.ano as number | undefined) || (item.created_at ? new Date(item.created_at).getFullYear() : undefined);
      const fileName = gerarNomeArquivoContrato(nomeAluno, ano);

      setIsDownloading(item.id);
      try {
        let blob: Blob;
        if (targetId) {
          try {
            blob = await downloadMutation.mutateAsync(targetId);
          } catch {
            if (urlContrato) {
              const res = await fetch(urlContrato);
              if (!res.ok) throw new Error("Erro ao baixar documento");
              blob = await res.blob();
            } else {
              throw new Error("Falha no download");
            }
          }
        } else if (urlContrato) {
          const res = await fetch(urlContrato);
          if (!res.ok) throw new Error("Erro ao baixar documento");
          blob = await res.blob();
        } else {
          throw new Error("Identificador não encontrado");
        }

        if (Capacitor.isNativePlatform()) {
          const base64Data = await blobToBase64(blob);
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });

          await Share.share({
            title: `Download Contrato - ${nomeAluno}`,
            files: [savedFile.uri],
            dialogTitle: "Download do Contrato",
          });
        } else {
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          toast.success("Download iniciado com sucesso!");
        }
      } catch (err: unknown) {
        const errorMsg = String((err as { message?: string })?.message || "").toLowerCase();
        const isCancel =
          errorMsg.includes("canceled") ||
          errorMsg.includes("cancelled") ||
          errorMsg.includes("dismissed") ||
          errorMsg.includes("abort");

        if (!isCancel) {
          toast.error("Erro ao realizar download do contrato.");
        }
      } finally {
        setIsDownloading(null);
      }
    },
    [downloadMutation]
  );

  const handleCompartilharContrato = useCallback(
    async (item: ContratoListItem) => {
      const urlContrato = obterUrlDocumentoContrato(item);
      if (!urlContrato) {
        toast.error("Documento do contrato não disponível.");
        return;
      }

      const nomeAluno = item.passageiro?.nome || item.nome || "";
      const ano = (item.dados_contrato?.ano as number | undefined) || (item.created_at ? new Date(item.created_at).getFullYear() : undefined);
      const fileName = gerarNomeArquivoContrato(nomeAluno, ano);

      await shareContratoFile({
        url: urlContrato,
        filename: fileName,
        title: `Contrato - ${nomeAluno}`,
      });
    },
    []
  );

  const isActionLoading =
    deleteMutation.isPending ||
    substituirMutation.isPending ||
    createMutation.isPending ||
    previewMutation.isPending ||
    downloadMutation.isPending;

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
    isDownloading,
    isContratoAtivo,
    isContratoConfigurado,
    handleRefresh,
    handleOpenContractSetup,
    handleActivateContracts,
    handleToggleContracts,
    isToggling,
    handleOpenPreview,
    handleOpenImportarContrato,
    handleDownloadContrato,
    handleCompartilharContrato,
    isPreviewLoading: previewMutation.isPending,
    isPreviewPdfOpen,
    setIsPreviewPdfOpen,
    pdfUrl,
    hasActiveFilters,
    setFilters,
    actions: {
      onVerPassageiro: handleVerPassageiro,
      onCopiarLink: handleCopiarLink,
      onEnviarWhatsApp: handleEnviarWhatsApp,
      onCompartilharWhatsApp: handleCompartilharContrato,
      onDownload: handleDownloadContrato,
      onExcluir: handleExcluir,
      onSubstituir: handleSubstituir,
      onGerarContrato: handleGerarContrato,
      onCompletarCadastro: handleCompletarCadastro,
      onImportarContrato: handleOpenImportarContrato,
      onVisualizarLink: handleVisualizarLink,
      onVisualizarFinal: handleVisualizarFinal,
    }
  };
}
