import { ROUTES } from "@/constants/routes";
import { BASE_DOMAIN } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  obterStatusConfiguracaoContrato,
  StatusConfiguracaoContrato,
  obterUrlDocumentoContrato,
  gerarNomeArquivoContrato,
  shareContratoFile,
  downloadContratoFile,
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
import { toast } from "@/utils/notifications/toast";

export function useContratosViewModel() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openConfirmarGerarContratoDialog,
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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const contratosFilters = useMemo(
    () => ({ tab: activeTab, search: debouncedSearch, page, limit }),
    [activeTab, debouncedSearch, page, limit]
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
    setPage(1);
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      const anchor = document.getElementById("contratos-tabs-anchor");
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

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
    navigate(ROUTES.PRIVATE.MOTORISTA.CONTRACT_SETUP);
  }, [navigate]);

  const handleToggleContracts = useCallback(async (active: boolean) => {
    if (!profile?.id) return;

    if (active && !profile.assinatura_digital_url) {
      navigate(ROUTES.PRIVATE.MOTORISTA.CONTRACT_SETUP);
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
              ...(profile.config_contrato ?? {}),
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
  }, [profile, refetchKPIs, refetchContratos, openConfirmationDialog, closeConfirmationDialog, refreshProfile, navigate]);

  const handleActivateContracts = useCallback(() => {
    navigate(ROUTES.PRIVATE.MOTORISTA.CONTRACT_SETUP);
  }, [navigate]);

  const handleVerPassageiro = useCallback((id: string) => {
    navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", id));
  }, [navigate]);

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

  const handleEnviarWhatsApp = useCallback((item: ContratoListItem) => {
    const token = item.token_acesso || item.id;
    const finalLink = `${BASE_DOMAIN}/assinar/${token}`;

    const respObj = item.passageiro?.responsavel_principal || item.responsavel_principal;
    const telefone = respObj?.telefone || (item.dados_contrato as Record<string, unknown> | undefined)?.telefoneResponsavel as string | undefined;

    const url = buildContratoWhatsAppUrl({
      telefoneResponsavel: telefone,
      nomeResponsavel: respObj?.nome || "",
      nomePassageiro: item.passageiro?.nome || item.nome || "",
      link: finalLink,
    });

    openBrowserLink(url);
  }, []);

  const handleSubstituir = useCallback((id: string, item?: ContratoListItem) => {
    const rawPassageiro = (item?.passageiro || (item?.tipo === "passageiro" ? item : null)) as unknown as Passageiro | undefined;
    const passageiroResolvido = rawPassageiro || ({
      id: item?.passageiro_id || "",
      nome: item?.nome || "Aluno",
      responsavel_principal: item?.responsavel_principal,
      valor_cobranca: item?.valor_parcela || item?.valor_cobranca,
      dia_vencimento: item?.dados_contrato?.diaVencimento as number,
    } as Passageiro);

    openConfirmarGerarContratoDialog({
      passageiro: passageiroResolvido,
      isSubstituicao: true,
      contratoIdParaSubstituir: id,
    });
  }, [openConfirmarGerarContratoDialog]);

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
      openConfirmarGerarContratoDialog({
        passageiro: rawPassageiro,
        valorMensal: Number(rawPassageiro.valor_cobranca || item?.dados_contrato?.valorMensal) || undefined,
        diaVencimento: Number(rawPassageiro.dia_vencimento || item?.dados_contrato?.diaVencimento) || undefined,
        isSubstituicao: false,
      });
      return;
    }

    openGerarContratoValidadorDialog({
      passageiroId,
      initialPassageiro: rawPassageiro,
      onSuccess: (_id, _bypassed, updatedValues, updatedPassageiro) => {
        const passageiroResolvido = updatedPassageiro || queryClient.getQueryData<Passageiro>(["passageiro", passageiroId]) || rawPassageiro || ({
          id: passageiroId,
          nome: item?.nome || "Aluno",
          responsavel_principal: item?.responsavel_principal,
        } as Passageiro);

        const valorMensal = updatedValues?.valorMensal ?? (Number(passageiroResolvido?.valor_cobranca || item?.dados_contrato?.valorMensal) || undefined);
        const diaVencimento = updatedValues?.diaVencimento ?? (Number(passageiroResolvido?.dia_vencimento || item?.dados_contrato?.diaVencimento) || undefined);

        openConfirmarGerarContratoDialog({
          passageiro: passageiroResolvido,
          valorMensal,
          diaVencimento,
          dataInicio: passageiroResolvido?.data_inicio_transporte || undefined,
          dataFim: passageiroResolvido?.data_fim_transporte || undefined,
          isSubstituicao: false,
        });
      }
    });
  }, [openGerarContratoValidadorDialog, openConfirmarGerarContratoDialog, queryClient]);

  const handleCompletarCadastro = useCallback((passageiroId: string, item?: ContratoListItem) => {
    handleGerarContrato(passageiroId, item);
  }, [handleGerarContrato]);

  const handleOpenImportarContrato = useCallback((passageiroId?: string, passageiro?: Passageiro | ContratoListItem) => {
    const rawPass = (passageiro && "passageiro" in passageiro && passageiro.passageiro)
      ? passageiro.passageiro
      : passageiro;

    openImportarContratoDialog({
      passageiroId,
      passageiro: rawPass as unknown as Passageiro,
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

        await downloadContratoFile({
          blob,
          url: urlContrato,
          filename: fileName,
          title: `Download Contrato - ${nomeAluno}`,
        });
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
    page,
    setPage,
    limit,
    setLimit,
    totalRecords: contratosRes?.total ?? 0,
    totalPages: contratosRes?.pagination?.totalPages ?? Math.max(1, Math.ceil((contratosRes?.total ?? 0) / limit)),
    handlePageChange,
    pagination: contratosRes?.pagination,
    isLoading: isLoadingContratos || isLoadingKPIs,
    isLoadingKPIs,
    isLoadingContratos,
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
