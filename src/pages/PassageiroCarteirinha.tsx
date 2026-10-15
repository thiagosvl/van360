import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { ROUTES } from "@/constants/routes";
import { BASE_DOMAIN, STORAGE_KEYS } from "@/constants";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useTutorialsConfig } from "@/hooks";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";


import { CarteirinhaSkeleton, CarteirinhaHeaderSkeleton } from "@/components/skeletons";

import {
  CarteirinhaCobrancas,
  CarteirinhaDadosPessoais,
  CarteirinhaHeader,
  CarteirinhaObservacoes,
  CarteirinhaContrato,
  CarteirinhaResponsaveis,
} from "@/components/features/passageiro/carteirinha";
import { CarteirinhaAusencias } from "@/components/features/carteirinha/CarteirinhaAusencias";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppTabNav, AppTabItem } from "@/components/ui/AppTabNav";
import { AnoLetivoSelect } from "@/components/common/AnoLetivoSelect";
import { Banner } from "@/components/ui/Banner";
import {
  DeletePassageiroOptionsContent,
  DeletePassageiroMode,
} from "@/components/features/passageiro/DeletePassageiroOptionsContent";
import { CalendarClock, FileText, User, Users, Wallet } from "lucide-react";

import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog, useCobrancasByPassageiro,
  useCreateCobranca,
  useDeleteCobranca,
  useDeletePassageiro,
  useDeletePassageiroMatricula,
  useDesfazerPagamento,
  useIsMobile, usePassageiro,
  useToggleAtivoPassageiro,
  useToggleNotificacoesCobranca,
  useUpdateCobranca,
  useUpdatePassageiro
} from "@/hooks";
import { useCreateContrato, useSubstituirContrato, useDeleteContrato } from "@/hooks/api/useContratos";
import { usePassageiroRotas } from "@/hooks/api/useRoutes";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { CobrancaStatus, ContratoProvider, ContratoStatus, PassageiroFormModes, RenovacaoStatus } from "@/types/enums";
import { useQueryClient } from "@tanstack/react-query";

import { openBrowserLink } from "@/utils/browser";
import { toast } from "@/utils/notifications/toast";
import { buildReciboWhatsAppMessage, buildContratoWhatsAppUrl, buildContratoAssinadoWhatsAppUrl } from "@/utils/whatsappTemplates";

import { Cobranca } from "@/types/cobranca";

import { Passageiro } from "@/types/passageiro";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { getNowBR, getStartOfDayBR, parseLocalDate } from "@/utils/dateUtils";
import {
  obterUrlDocumentoContrato,
  isPassageiroIncompleto,
  isContratoAtivoNaConta,
  hasPendenciasParaGerarContrato,
} from "@/utils/domain";
import { shouldGeneratePassengerProjection } from "@/utils/domain/cobrancaProjection";

const currentYear = getNowBR().getFullYear().toString();

import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { PERMISSIONS } from "@/config/permissions";
import { cn } from "@/lib/utils";

export default function PassageiroCarteirinha() {
  const navigate = useNavigate();
  const { can, isSubConta } = usePermissions();
  const { config: tutorialConfig, shouldShowTutorial } = useTutorialsConfig("carteirinha");
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openCobrancaFormDialog,
    openManualPaymentDialog,
    openReceiptDialog,
    openGerarContratoValidadorDialog,
    openConfirmarGerarContratoDialog,
    openPassageiroFinanceiroDialog,
    openFirstChargeDialog,
  } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();

  const canViewFinancials =
    can(PERMISSIONS.FINANCEIRO_VISUALIZAR) ||
    can(PERMISSIONS.COBRANCAS_GERENCIAR) ||
    can(PERMISSIONS.PASSAGEIROS_COBRANCA_VISUALIZAR) ||
    can(PERMISSIONS.PASSAGEIROS_GERENCIAR);
  const canManageContracts = can(PERMISSIONS.CONTRATOS_GERENCIAR) && !isSubConta;
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletedRef = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = useMemo(() => {
    const tabs: string[] = [];
    if (canViewFinancials) tabs.push("parcelas");
    tabs.push("dados-pessoais", "responsaveis");
    if (canManageContracts) tabs.push("contrato");
    tabs.push("ausencias");
    return tabs;
  }, [canViewFinancials, canManageContracts]);

  const urlTab = searchParams.get("tab");
  const defaultTab = canViewFinancials ? "parcelas" : "dados-pessoais";
  const initialTab = urlTab && validTabs.includes(urlTab) ? urlTab : defaultTab;
  const [activeTab, setActiveTabState] = useState(initialTab);

  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab, validTabs]);

  const handleTabChange = (val: string) => {
    setActiveTabState(val);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("tab", val);
      return updated;
    });
  };

  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
  const deletePassageiroMatricula = useDeletePassageiroMatricula();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();
  const updateCobranca = useUpdateCobranca();
  const createCobranca = useCreateCobranca();
  const deleteCobranca = useDeleteCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const createContrato = useCreateContrato();
  const substituirContrato = useSubstituirContrato();
  const deleteContrato = useDeleteContrato();

  const isActionLoading =
    createContrato.isPending ||
    substituirContrato.isPending ||
    deleteContrato.isPending ||
    updatePassageiro.isPending ||
    deletePassageiro.isPending ||
    deletePassageiroMatricula.isPending ||
    toggleAtivoPassageiro.isPending ||
    createCobranca.isPending ||
    updateCobranca.isPending ||
    deleteCobranca.isPending ||
    desfazerPagamento.isPending ||
    toggleNotificacoes.isPending ||
    isDeleting;

  const [isCopiedEndereco, setIsCopiedEndereco] = useState(false);
  const [isCopiedTelefone, setIsCopiedTelefone] = useState(false);

  const urlAno = searchParams.get("ano");
  const [yearFilter, setYearFilterState] = useState(urlAno || currentYear);
  const hasSetInitialYear = useRef(Boolean(urlAno));

  const setYearFilter = useCallback(
    (newYear: string) => {
      setYearFilterState(newYear);
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("ano", newYear);
          return updated;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const [isObservacoesEditing, setIsObservacoesEditing] = useState(false);
  const [obsText, setObsText] = useState("");
  const [mostrarTodasCobrancas, setMostrarTodasCobrancas] = useState(false);
  const { user, loading: isSessionLoading } = useSession();
  const { profile, summary, isLoading: isProfileLoading } = useProfile(user?.id);

  const {
    data: passageiroData,
    isLoading: isPassageiroLoading,
    isError: isPassageiroError,
    error: passageiroError,
    refetch: refetchPassageiro,
  } = usePassageiro(passageiro_id, {
    enabled: !!passageiro_id && !isDeleting && !isDeletedRef.current,
  });

  useEffect(() => {
    if (passageiroData && !hasSetInitialYear.current) {
      hasSetInitialYear.current = true;
      const anos = passageiroData.anos_matriculados || [];
      const currNum = Number(currentYear);
      if (anos.includes(currNum)) {
        setYearFilterState(String(currNum));
      } else if (anos.length > 0) {
        setYearFilterState(String(anos[anos.length - 1]));
      } else if (passageiroData.ano_letivo) {
        setYearFilterState(String(passageiroData.ano_letivo));
      }
    }
  }, [passageiroData]);

  const selectedYearNum = Number(yearFilter) || Number(currentYear);

  const passageiro = useMemo(() => {
    if (!passageiroData) return undefined as unknown as Passageiro;
    const mat = passageiroData.matriculas?.find(
      (m) => Number(m.ano_letivo) === selectedYearNum
    );
    if (!mat) return passageiroData as Passageiro;
    const rawContrato = mat.contrato || (mat as any);
    const contratoId = rawContrato?.id || (mat as any)?.contrato_id || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.contrato_id : undefined);
    const statusContrato = (rawContrato?.status || (mat as any)?.status_contrato || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.status_contrato : undefined)) as Passageiro["status_contrato"];
    const contratoStatus = (rawContrato?.status || (mat as any)?.contrato_status || (mat as any)?.status_contrato || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.contrato_status : undefined)) || "sem_contrato";
    const contratoProvider = (rawContrato?.provider || (mat as any)?.contrato_provider || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.contrato_provider : undefined)) as Passageiro["contrato_provider"];
    const minutaUrl = rawContrato?.minuta_url || (mat as any)?.minuta_url || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.minuta_url : undefined);
    const contratoFinalUrl = rawContrato?.contrato_final_url || (mat as any)?.contrato_final_url || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.contrato_final_url : undefined);
    const tokenAcesso = rawContrato?.token_acesso || (mat as any)?.token_acesso || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.token_acesso : undefined);
    const contratoAno = rawContrato?.ano || (mat as any)?.contrato_ano || (Number(passageiroData.ano_letivo) === selectedYearNum ? passageiroData.contrato_ano : null);
    const contratoUrl = contratoFinalUrl || minutaUrl || undefined;

    return {
      ...passageiroData,
      matricula_id: mat.id,
      ano_letivo: mat.ano_letivo,
      escola_id: mat.escola_id ?? undefined,
      veiculo_id: mat.veiculo_id ?? "",
      periodo: (mat.periodo as Passageiro["periodo"]) ?? passageiroData.periodo,
      modalidade: (mat.modalidade as Passageiro["modalidade"]) ?? passageiroData.modalidade,
      turma: mat.turma ?? undefined,
      sala: mat.sala ?? null,
      nome_professor: mat.nome_professor ?? undefined,
      horario_entrada: mat.horario_entrada ?? null,
      horario_saida: mat.horario_saida ?? null,
      valor_cobranca: Number(mat.valor_cobranca ?? 0),
      dia_vencimento: Number(mat.dia_vencimento ?? 10),
      isento: Boolean(mat.isento),
      data_inicio_transporte: mat.data_inicio_transporte ?? undefined,
      data_fim_transporte: mat.data_fim_transporte ?? undefined,
      data_inicio_cobranca: mat.data_inicio_cobranca ?? undefined,
      data_fim_cobranca: mat.data_fim_cobranca ?? undefined,
      ativo: Boolean(mat.ativo),
      escola: mat.escola ?? undefined,
      escola_nome: mat.escola?.nome ?? undefined,
      veiculo: mat.veiculo ?? undefined,
      contrato_id: contratoId,
      status_contrato: statusContrato,
      contrato_status: contratoStatus,
      contrato_provider: contratoProvider,
      minuta_url: minutaUrl,
      contrato_final_url: contratoFinalUrl,
      contrato_url: contratoUrl,
      token_acesso: tokenAcesso,
      contrato_ano: contratoAno,
    } as Passageiro;
  }, [passageiroData, selectedYearNum]);

  const {
    data: rotasPassageiro = [],
    isLoading: isRotasLoading,
  } = usePassageiroRotas(passageiro_id || "");

  const temRotas = (rotasPassageiro || []).length > 0;

  const totalPassageiros = summary?.contadores?.passageiros?.total ?? 0;



  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    isFetching: isCobrancasFetching,
    refetch: refetchCobrancas,
    isError: isCobrancasError,
  } = useCobrancasByPassageiro(passageiro_id, yearFilter, {
    enabled: !!passageiro_id && canViewFinancials && !isDeleting && !isDeletedRef.current,
  });

  const cobrancas = (cobrancasData || []) as Cobranca[];

  const mobileTabItems = useMemo<AppTabItem[]>(() => {
    const items: AppTabItem[] = [];
    if (canViewFinancials) {
      items.push({
        value: "parcelas",
        label: "Parcelas",
        icon: <Wallet className="w-3.5 h-3.5" />,
      });
    }
    items.push(
      {
        value: "dados-pessoais",
        label: "Dados Pessoais",
        icon: <User className="w-3.5 h-3.5" />,
      },
      {
        value: "responsaveis",
        label: "Responsáveis",
        icon: <Users className="w-3.5 h-3.5" />,
      }
    );
    if (canManageContracts) {
      items.push({
        value: "contrato",
        label: "Contrato",
        icon: <FileText className="w-3.5 h-3.5" />,
      });
    }
    items.push({
      value: "ausencias",
      label: "Ausências",
      icon: <CalendarClock className="w-3.5 h-3.5" />,
    });
    return items;
  }, [canViewFinancials, canManageContracts]);

  const loading =
    isSessionLoading ||
    isProfileLoading ||
    isPassageiroLoading ||
    (canViewFinancials && isCobrancasLoading);


  useEffect(() => {
    if (isCobrancasError) {
      toast.error("cobranca.erro.buscarHistorico", {
        description: "Não foi possível concluir a operação.",
      });
    }
  }, [isCobrancasError]);

  useEffect(() => {
    if (!passageiro_id || isDeleting || isDeletedRef.current || isPassageiroLoading) return;

    const isNotFoundError =
      isPassageiroError &&
      ((passageiroError as any)?.response?.status === 404 ||
        (passageiroError as any)?.status === 404);

    if (isNotFoundError || (!isPassageiroError && !passageiro)) {
      navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS, { replace: true });
    }
  }, [
    isPassageiroLoading,
    isPassageiroError,
    passageiroError,
    passageiro,
    passageiro_id,
    navigate,
    isDeleting,
  ]);

  useEffect(() => {
    if (passageiro && !loading) {
      setObsText(passageiro.observacoes || "");
    }
  }, [passageiro, loading]);

  useEffect(() => {
    if (passageiro) {
      setPageTitle(`Carteirinha Digital`);
    }
  }, [passageiro, setPageTitle]);
  const handlePassageiroFormSuccess = useCallback((data?: Passageiro | { passageiro?: Passageiro; id?: string }, meta?: { hasCriticalContractChanges?: boolean }) => {
    const wasIncomplete = isPassageiroIncompleto(passageiro);
    const rawData: Partial<Passageiro> = data
      ? ("passageiro" in data && data.passageiro ? data.passageiro : data)
      : {};
    const updatedPassageiro: Passageiro = {
      ...passageiro,
      ...rawData,
      status_contrato: rawData.status_contrato ?? passageiro?.status_contrato,
      contrato_id: rawData.contrato_id ?? passageiro?.contrato_id,
      contrato_provider: rawData.contrato_provider ?? passageiro?.contrato_provider,
    } as Passageiro;

    const valorFinal = Number(updatedPassageiro.valor_cobranca || 0);
    const diaFinal = Number(updatedPassageiro.dia_vencimento || 0);
    const isIsento = !!updatedPassageiro.isento;

    const now = getNowBR();
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();

    const hasCurrentMonthRealCharge = cobrancas.some(
      (c) => c.mes === currMonth && c.ano === currYear && c.status !== CobrancaStatus.CANCELADA
    );

    const isEligibleForFirstCharge = !isIsento && valorFinal > 0 && diaFinal > 0 && shouldGeneratePassengerProjection({
      passageiro: updatedPassageiro,
      targetMonth: currMonth,
      targetYear: currYear,
    });

    if (wasIncomplete && isEligibleForFirstCharge && !hasCurrentMonthRealCharge) {
      setTimeout(() => {
        openFirstChargeDialog({
          passageiro: updatedPassageiro,
        });
      }, 300);
      return;
    }

    const hasChanges = meta?.hasCriticalContractChanges === true;
    const isContratoAtivo = canManageContracts && isContratoAtivoNaConta(profile);
    const isContratoImportado = updatedPassageiro.contrato_provider === ContratoProvider.IMPORTADO;

    if (hasChanges && isContratoAtivo && !isContratoImportado) {
      setTimeout(() => {
        const hasActiveContract = updatedPassageiro.status_contrato === ContratoStatus.ASSINADO ||
          updatedPassageiro.status_contrato === ContratoStatus.PENDENTE;

        openConfirmarGerarContratoDialog({
          passageiro: updatedPassageiro,
          valorMensal: updatedPassageiro.valor_cobranca ? Number(updatedPassageiro.valor_cobranca) : undefined,
          diaVencimento: updatedPassageiro.dia_vencimento ? Number(updatedPassageiro.dia_vencimento) : undefined,
          dataInicio: updatedPassageiro.data_inicio_transporte || undefined,
          dataFim: updatedPassageiro.data_fim_transporte || undefined,
          isSubstituicao: hasActiveContract,
          contratoIdParaSubstituir: updatedPassageiro.contrato_id || undefined,
        });
      }, 300);
    }
  }, [passageiro, cobrancas, canManageContracts, openFirstChargeDialog, openConfirmarGerarContratoDialog, profile]);

  const handleEditClick = useCallback(() => {
    openPassageiroFormDialog({
      mode: PassageiroFormModes.EDIT,
      editingPassageiro: passageiro,
      onSuccess: handlePassageiroFormSuccess,
    });
  }, [openPassageiroFormDialog, passageiro, handlePassageiroFormSuccess]);

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (label === "Endereço") {
        setIsCopiedEndereco(true);
        setTimeout(() => {
          setIsCopiedEndereco(false);
        }, 1000);
      } else {
        setIsCopiedTelefone(true);
        setTimeout(() => {
          setIsCopiedTelefone(false);
        }, 1000);
      }
    } catch (err: any) {
      toast.error("sistema.erro.copiar", {
        description:
          err.message ||
          "Não foi possível copiar para a área de transferência.",
      });
    }
  };

  const handleStartObsEdit = useCallback(() => {
    setObsText(passageiro?.observacoes || "");
    setIsObservacoesEditing(true);
  }, [passageiro]);

  const handleCancelObsEdit = useCallback(() => {
    setObsText(passageiro?.observacoes || "");
    setIsObservacoesEditing(false);
  }, [passageiro]);

  const handleSaveObservacoes = async () => {
    if (!passageiro_id) return;

    updatePassageiro.mutate(
      {
        id: passageiro_id,
        data: { observacoes: obsText },
      },
      {
        onSuccess: () => {
          setIsObservacoesEditing(false);
        },
        onError: () => {
          setObsText(passageiro?.observacoes || "");
        },
      },
    );
  };

  const handleToggleClick = (statusAtual: boolean) => {
    const action = statusAtual ? "desativar" : "ativar";
    openConfirmationDialog({
      title:
        action === "ativar" ? "Reativar aluno?" : "Desativar aluno?",
      description:
        action === "ativar"
          ? "O aluno voltará a aparecer nas listas de alunos ativos e novas parcelas serão geradas automaticamente conforme as condições do contrato."
          : "O aluno será desativado e novas parcelas deixarão de ser geradas automaticamente. Você poderá reativá-lo a qualquer momento.",
      confirmText: action === "ativar" ? "Reativar" : "Desativar",
      variant: action === "desativar" ? "warning" : "default",
      onConfirm: async () => {
        if (!passageiro || !passageiro_id) return;
        try {
          await toggleAtivoPassageiro.mutateAsync({
            id: passageiro_id,
            novoStatus: !passageiro.ativo,
            anoLetivo: selectedYearNum,
          });
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          safeCloseDialog(closeConfirmationDialog);
          throw error;
        }
      },
    });
  };

  const handleEnviarWhatsApp = useCallback(() => {
    if (!passageiro) return;

    const isAssinado = passageiro.status_contrato === ContratoStatus.ASSINADO;
    const urlContrato = obterUrlDocumentoContrato(passageiro);
    const token = passageiro.token_acesso || passageiro.id;
    const finalLink = isAssinado && urlContrato ? urlContrato : `${BASE_DOMAIN}/assinar/${token}`;

    const telefone = passageiro.responsavel_principal?.telefone;

    const url = isAssinado
      ? buildContratoAssinadoWhatsAppUrl({
        telefoneResponsavel: telefone,
        nomeResponsavel: passageiro.responsavel_principal?.nome || "",
        nomePassageiro: passageiro.nome,
        link: finalLink,
      })
      : buildContratoWhatsAppUrl({
        telefoneResponsavel: telefone,
        nomeResponsavel: passageiro.responsavel_principal?.nome || "",
        nomePassageiro: passageiro.nome,
        link: finalLink,
      });

    openBrowserLink(url);
  }, [passageiro]);

  const handleToggleLembretes = useCallback(
    async (cobranca: Cobranca) => {
      toggleNotificacoes.mutate({
        cobrancaId: cobranca.id,
        desativar: !cobranca.desativar_lembretes,
      });
    },
    [toggleNotificacoes],
  );



  const handleDesfazerClick = useCallback(
    (cobrancaId: string) => {
      openConfirmationDialog({
        title: "Desfazer pagamento?",
        description:
          "O pagamento será removido e a parcela voltará a ficar pendente. Confirmar?",
        confirmText: "Desfazer",
        variant: "warning",
        onConfirm: async () => {
          try {
            await desfazerPagamento.mutateAsync(cobrancaId);
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [desfazerPagamento, closeConfirmationDialog],
  );

  const handleExcluirCobranca = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaDeleteDialog({
        onConfirm: async () => {
          if (cobranca.isProjection) {
            await createCobranca.mutateAsync({
              passageiro_id: cobranca.passageiro_id,
              usuario_id: passageiro?.usuario_id || user?.id,
              mes: Number(cobranca.mes),
              ano: Number(cobranca.ano),
              valor: Number(cobranca.valor),
              data_vencimento: cobranca.data_vencimento,
              status: CobrancaStatus.CANCELADA,
            });
          } else {
            await deleteCobranca.mutateAsync(cobranca.id);
          }
        },
        onEdit: cobranca.isProjection ? undefined : () => {
          openCobrancaEditDialog({
            cobranca,
          });
        }
      });
    },
    [deleteCobranca, createCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, passageiro?.usuario_id, user?.id]
  );

  const openPaymentDialog = (cobranca: Cobranca) => {
    openManualPaymentDialog({
      cobrancaId: cobranca.id,
      passageiroNome: passageiro.nome,
      responsavelNome: passageiro.responsavel_principal?.nome || "",
      valorOriginal: Number(cobranca.valor),
      status: cobranca.status,
      dataVencimento: cobranca.data_vencimento,
      observacao: cobranca.observacao,
    });
  };

  const temCobrancasVencidas = useMemo(() => {
    const hoje = getStartOfDayBR();
    return cobrancas.some(
      (c) =>
        c.status === CobrancaStatus.PENDENTE && parseLocalDate(c.data_vencimento) < hoje,
    );
  }, [cobrancas]);

  const handleDeleteContrato = useCallback(() => {
    if (!passageiro?.contrato_id) return;
    openConfirmationDialog({
      title: "Excluir Contrato?",
      description: "Tem certeza que deseja excluir o contrato deste aluno? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteContrato.mutateAsync(passageiro.contrato_id!);
          safeCloseDialog(closeConfirmationDialog);
        } catch {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  }, [passageiro?.contrato_id, openConfirmationDialog, closeConfirmationDialog, deleteContrato]);

  const anosMatriculados = useMemo(() => {
    const list = passageiro?.anos_matriculados || [];
    if (list.length > 0) return list;
    return [passageiro?.ano_letivo || selectedYearNum];
  }, [passageiro?.anos_matriculados, passageiro?.ano_letivo, selectedYearNum]);

  const anosDisponiveisCarteirinha = useMemo(() => {
    return Array.from(new Set([...anosMatriculados, selectedYearNum])).sort((a, b) => a - b);
  }, [anosMatriculados, selectedYearNum]);

  if (!can("passageiros.visualizar")) {
    return <AccessRestrictedState moduleName="Alunos" />;
  }

  const isNotFoundError =
    isPassageiroError &&
    ((passageiroError as any)?.response?.status === 404 ||
      (passageiroError as any)?.status === 404);

  if (
    !loading &&
    (isNotFoundError || (!isPassageiroError && !passageiro && passageiro_id))
  ) {
    return null;
  }

  if (loading || !passageiro) {
    return (
      <div className="overflow-hidden w-full max-w-full h-full">
        <CarteirinhaSkeleton />
      </div>
    );
  }

  const pullToRefreshReload = async () => {
    await Promise.all([
      refetchPassageiro(),
      refetchCobrancas(),
      queryClient.invalidateQueries({ queryKey: ["passageiro-ausencias", passageiro_id] }),
      queryClient.invalidateQueries({ queryKey: ["passageiro-rotas", passageiro_id] }),
    ]);
  };

  const targetRenewalYear = selectedYearNum + 1;

  const renovacaoDestino = (passageiro?.renovacoes || []).find(
    (r) => Number(r.ano_destino) === targetRenewalYear
  );

  const hasResponsavel = Boolean(
    passageiro?.responsavel_principal?.nome ||
    passageiro?.responsavel_principal?.id ||
    (passageiro?.responsaveis && passageiro.responsaveis.length > 0)
  );

  const isFinanceiroIncompleto = isPassageiroIncompleto(passageiro);
  const isFinanceiroRegular = passageiro?.isento === true || !isFinanceiroIncompleto;

  const isRenovacaoRecusada = renovacaoDestino?.status === RenovacaoStatus.RECUSADO;
  const isRenovacaoConfirmada = renovacaoDestino?.status === RenovacaoStatus.CONFIRMADO;
  const jaMatriculadoNoProximoAno = anosMatriculados.includes(targetRenewalYear);

  const showRenewalBanner =
    can("renovacoes.gerenciar") &&
    Boolean(passageiro?.ativo) &&
    hasResponsavel &&
    isFinanceiroRegular &&
    selectedYearNum <= Number(currentYear) &&
    !jaMatriculadoNoProximoAno &&
    !isRenovacaoRecusada &&
    !isRenovacaoConfirmada;

  const renderRenewalBanner = () => {
    if (!showRenewalBanner) return null;

    return (
      <Banner
        variant="info"
        title={`Renovação ${selectedYearNum + 1} pendente`}
        description={`Este aluno ainda não possui matrícula confirmada para ${selectedYearNum + 1}.`}
        action={{
          label: "Ir para Renovação",
          onClick: () =>
            navigate(
              `${ROUTES.PRIVATE.MOTORISTA.RENOVATION}?ano=${selectedYearNum + 1}&search=${encodeURIComponent(passageiro.nome)}`
            ),
        }}
      />
    );
  };

  const cobrancasProps = {
    cobrancas,
    passageiro,
    yearFilter,
    onYearFilterChange: undefined,
    mostrarTodasCobrancas,
    limiteCobrancasMobile: 3,
    onOpenCobrancaDialog: (mes?: number, ano?: number, lockFoiPago?: boolean, lockMesAno?: boolean, availableMonths?: number[]) => {
      if (!passageiro_id) return;
      openCobrancaFormDialog({
        passageiroId: passageiro_id,
        passageiroNome: formatShortName(passageiro?.nome, true),
        passageiroResponsavelNome: formatFirstName(passageiro?.responsavel_principal?.nome),
        valorCobranca: Number(passageiro?.valor_cobranca),
        diaVencimento: Number(passageiro?.dia_vencimento),
        mes,
        ano: ano ?? (yearFilter ? Number(yearFilter) : undefined),
        lockFoiPago,
        lockMesAno,
        availableMonths,
      });
    },
    onEditCobranca: (cobranca: Cobranca) => {
      openCobrancaEditDialog({
        cobranca,
      });
    },
    onRegistrarPagamento: (cobranca: Cobranca) => {
      const targetPassageiro = cobranca.passageiro || passageiro;
      if (cobranca.isProjection && isPassageiroIncompleto(targetPassageiro)) {
        openConfirmationDialog({
          title: "Valor das parcelas não configurado",
          description:
            "Para registrar o pagamento desta previsão, primeiro é necessário definir o valor e o vencimento da parcela. Deseja configurar agora?",
          confirmText: "Configurar agora",
          cancelText: "Fazer depois",
          onConfirm: () => {
            safeCloseDialog(closeConfirmationDialog);
            setTimeout(() => {
              if (targetPassageiro) {
                openPassageiroFinanceiroDialog({ passageiro: targetPassageiro });
              }
            }, 100);
          },
        });
        return;
      }
      openPaymentDialog(cobranca);
    },
    onToggleLembretes: handleToggleLembretes,
    onDesfazerPagamento: handleDesfazerClick,
    onExcluirCobranca: handleExcluirCobranca,
    onToggleClick: handleToggleClick,
    onVerRecibo: (url: string, cobranca: Cobranca) =>
      openReceiptDialog({
        receiptUrl: url,
        cobrancaDescricao: buildReciboWhatsAppMessage({
          nomeResponsavel:
            passageiro.responsavel_principal?.nome ||
            cobranca.passageiro?.responsavel_principal?.nome,
          nomePassageiro: passageiro.nome,
          generoPassageiro: passageiro.genero || cobranca.passageiro?.genero,
          mes: cobranca.mes,
          ano: cobranca.ano,
        }),
        cobrancaId: cobranca.id,
        mes: cobranca.mes,
        ano: cobranca.ano,
        passageiroId: cobranca.passageiro_id || passageiro.id,
        nomePassageiro: passageiro.nome,
        nomeResponsavel:
          passageiro.responsavel_principal?.nome ||
          cobranca.passageiro?.responsavel_principal?.nome,
        generoPassageiro: passageiro.genero || cobranca.passageiro?.genero,
      }),
    onActionSuccess: () => {
      refetchPassageiro();
      refetchCobrancas();
    },
  };

  const infoProps = {
    passageiro,
    temCobrancasVencidas,
    isCopiedEndereco,
    isCopiedTelefone,
    onEditClick: handleEditClick,
    onCopyToClipboard: handleCopyToClipboard,
    onToggleClick: handleToggleClick,
    onEnviarWhatsApp: handleEnviarWhatsApp,
    contratosAtivos: isContratoAtivoNaConta(profile),
    onDeleteClick: () => {
      const hasMultipleYears = anosMatriculados.length > 1;
      let selectedMode: DeletePassageiroMode = "matricula";

      openConfirmationDialog({
        title: hasMultipleYears ? "Como deseja excluir?" : "Excluir aluno?",
        description: hasMultipleYears ? (
          <DeletePassageiroOptionsContent
            nomeAluno={passageiro.nome}
            anoSelecionado={selectedYearNum}
            anosMatriculados={anosMatriculados}
            defaultMode="matricula"
            onChangeMode={(m) => {
              selectedMode = m;
            }}
          />
        ) : (
          "Tem certeza que deseja excluir este aluno? Esta ação excluirá permanentemente o cadastro e todos os dados do aluno."
        ),
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          if (!passageiro_id) return;

          if (hasMultipleYears && selectedMode === "matricula") {
            try {
              const res = await deletePassageiroMatricula.mutateAsync({
                id: passageiro_id,
                anoLetivo: selectedYearNum,
              });
              safeCloseDialog(closeConfirmationDialog);
              if (res.deletedStudent) {
                navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS, { replace: true });
              } else if (res.remainingYears && res.remainingYears.length > 0) {
                setYearFilter(String(res.remainingYears[res.remainingYears.length - 1]));
              }
            } catch {
              safeCloseDialog(closeConfirmationDialog);
            }
            return;
          }

          setIsDeleting(true);
          try {
            isDeletedRef.current = true;
            await deletePassageiro.mutateAsync(passageiro_id);
            safeCloseDialog(closeConfirmationDialog);
            navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS, { replace: true });
          } catch {
            isDeletedRef.current = false;
            safeCloseDialog(closeConfirmationDialog);
          } finally {
            if (!isDeletedRef.current) {
              setIsDeleting(false);
            }
          }
        },
      });
    },
    onToggleNotificacoesClick: () => {
      const isAtivo = !!passageiro.enviar_notificacoes;
      const action = isAtivo ? "desativar" : "ativar";
      openConfirmationDialog({
        title: action === "ativar" ? "Ativar notificações?" : "Desativar notificações?",
        description: action === "ativar"
          ? "O responsável do aluno voltará a receber lembretes e notificações de cobrança."
          : "O responsável do aluno não receberá mais lembretes e notificações de cobrança.",
        confirmText: action === "ativar" ? "Confirmar" : "Confirmar",
        variant: action === "desativar" ? "warning" : "default",
        onConfirm: async () => {
          try {
            await updatePassageiro.mutateAsync({
              id: passageiro.id!,
              data: { enviar_notificacoes: !isAtivo },
            });
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            toast.error("Erro ao atualizar a configuração de notificações.");
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    onContractAction: () => {
      const statusContrato = passageiro.status_contrato?.toString().toLowerCase();
      const isAssinado =
        statusContrato === ContratoStatus.ASSINADO ||
        statusContrato === 'assinado' ||
        statusContrato === '2';
      const isPendente =
        statusContrato === ContratoStatus.PENDENTE ||
        statusContrato === 'pendente' ||
        statusContrato === '1' ||
        (!!passageiro.contrato_id && !passageiro.status_contrato);

      const urlContrato = obterUrlDocumentoContrato(passageiro);

      if (isAssinado || (isPendente && urlContrato)) {
        if (urlContrato) {
          openBrowserLink(urlContrato);
        }
      } else {
        if (!hasPendenciasParaGerarContrato(passageiro)) {
          openConfirmarGerarContratoDialog({
            passageiro,
            valorMensal: passageiro.valor_cobranca ? Number(passageiro.valor_cobranca) : undefined,
            diaVencimento: passageiro.dia_vencimento ? Number(passageiro.dia_vencimento) : undefined,
            isSubstituicao: false,
          });
          return;
        }

        openGerarContratoValidadorDialog({
          passageiroId: passageiro.id!,
          initialPassageiro: passageiro,
          onSuccess: (_id, _bypassed, updatedValues, freshPassageiro) => {
            const finalPass = freshPassageiro || passageiro;
            const valorMensal = updatedValues?.valorMensal ?? (finalPass.valor_cobranca ? Number(finalPass.valor_cobranca) : undefined);
            const diaVencimento = updatedValues?.diaVencimento ?? (finalPass.dia_vencimento ? Number(finalPass.dia_vencimento) : undefined);

            openConfirmarGerarContratoDialog({
              passageiro: finalPass,
              valorMensal,
              diaVencimento,
              dataInicio: finalPass.data_inicio_transporte || undefined,
              dataFim: finalPass.data_fim_transporte || undefined,
              isSubstituicao: false,
            });
          },
        });
      }
    },
  };

  const observacoesProps = {
    observacoes: passageiro.observacoes,
    isEditing: isObservacoesEditing,
    obsText,
    isSaving: updatePassageiro.isPending,
    onStartEdit: handleStartObsEdit,
    onCancelEdit: handleCancelObsEdit,
    onChangeText: setObsText,
    onSave: handleSaveObservacoes,
  };

  const renderTabContents = (extraClassName?: string) => (
    <>
      {canViewFinancials && (
        <TabsContent value="parcelas" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-[24px]" />}>
            <CarteirinhaCobrancas {...cobrancasProps} />
          </Suspense>
        </TabsContent>
      )}

      <TabsContent value="dados-pessoais" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-[24px]" />}>
          <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 sm:p-6">
            <CarteirinhaDadosPessoais
              passageiro={passageiro}
              isCopiedEndereco={isCopiedEndereco}
              isCopiedTelefone={isCopiedTelefone}
              onCopyToClipboard={handleCopyToClipboard}
              onContractAction={infoProps.onContractAction}
              contratosAtivos={infoProps.contratosAtivos}
              onEnviarWhatsApp={infoProps.onEnviarWhatsApp}
              onEditClick={handleEditClick}
            />
          </div>
        </Suspense>

        <Suspense fallback={<Skeleton className="h-32 w-full rounded-[24px]" />}>
          <CarteirinhaObservacoes {...observacoesProps} />
        </Suspense>
      </TabsContent>

      <TabsContent value="responsaveis" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-[24px]" />}>
          <CarteirinhaResponsaveis
            passageiro={passageiro}
            onEditClick={handleEditClick}
            hideNotificacoesRota={!temRotas}
            onRefresh={() => {
              refetchPassageiro();
            }}
          />
        </Suspense>
      </TabsContent>

      {canManageContracts && (
        <TabsContent value="contrato" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
          <Suspense fallback={<Skeleton className="h-32 w-full rounded-[24px]" />}>
            <CarteirinhaContrato
              passageiro={passageiro}
              contratosAtivos={infoProps.contratosAtivos}
              onContractAction={infoProps.onContractAction}
              onDeleteContrato={handleDeleteContrato}
              onEnviarWhatsApp={infoProps.onEnviarWhatsApp}
              onEditClick={handleEditClick}
            />
          </Suspense>
        </TabsContent>
      )}

      <TabsContent value="ausencias" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-[24px]" />}>
          <CarteirinhaAusencias
            passageiro={passageiro}
            temRotas={temRotas}
            isRotasLoading={isRotasLoading}
          />
        </Suspense>
      </TabsContent>
    </>
  );

  const renderYearAndRenewalHeader = () => {
    const hasAnoSelect = anosDisponiveisCarteirinha.length > 1;
    const renewalBanner = renderRenewalBanner();

    if (!hasAnoSelect && !renewalBanner) return null;

    return (
      <div className="space-y-3">
        {hasAnoSelect && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[#737373]">
              Matrícula de {selectedYearNum}
            </span>
            <AnoLetivoSelect
              ano={selectedYearNum}
              onChangeAno={(novoAno) => setYearFilter(novoAno.toString())}
              anosDisponiveis={anosDisponiveisCarteirinha}
              label="Ano Letivo"
            />
          </div>
        )}

        {renewalBanner}
      </div>
    );
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-4 sm:space-y-6">
          {isMobile ? (
            <>
              {anosDisponiveisCarteirinha.length > 1 && (
                <div className="w-full">
                  <AnoLetivoSelect
                    ano={selectedYearNum}
                    onChangeAno={(novoAno) => setYearFilter(novoAno.toString())}
                    anosDisponiveis={anosDisponiveisCarteirinha}
                    label="Ano Letivo"
                    className="w-full justify-between h-10"
                  />
                </div>
              )}

              <Suspense fallback={<CarteirinhaHeaderSkeleton />}>
                <CarteirinhaHeader
                  passageiro={passageiro}
                  temCobrancasVencidas={temCobrancasVencidas}
                  onToggleClick={handleToggleClick}
                  onEditClick={handleEditClick}
                  onDeleteClick={infoProps.onDeleteClick}
                  onEnviarWhatsApp={handleEnviarWhatsApp}
                  onToggleNotificacoesClick={infoProps.onToggleNotificacoesClick}
                />
              </Suspense>

              {renderRenewalBanner()}

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <AppTabNav
                  activeTab={activeTab}
                  items={mobileTabItems}
                />

                {renderTabContents("mt-3.5 sm:mt-4")}
              </Tabs>
            </>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-4 space-y-4 sticky top-6">
                  <Suspense fallback={<CarteirinhaHeaderSkeleton />}>
                    <CarteirinhaHeader
                      passageiro={passageiro}
                      temCobrancasVencidas={temCobrancasVencidas}
                      onToggleClick={handleToggleClick}
                      onEditClick={handleEditClick}
                      onDeleteClick={infoProps.onDeleteClick}
                      onEnviarWhatsApp={handleEnviarWhatsApp}
                      onToggleNotificacoesClick={infoProps.onToggleNotificacoesClick}
                    />
                  </Suspense>

                  <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs p-1.5 sm:p-2">
                    <TabsList className="flex flex-col w-full bg-transparent p-0 gap-1 h-auto border-0">
                      {canViewFinancials && (
                        <TabsTrigger
                          value="parcelas"
                          className="w-full justify-start h-11 px-4 rounded-[18px] font-semibold text-sm transition-all duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer flex items-center gap-3.5 border-0"
                        >
                          <Wallet className="h-4 w-4 shrink-0 text-inherit" />
                          <span>Parcelas</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="dados-pessoais"
                        className="w-full justify-start h-11 px-4 rounded-[18px] font-semibold text-sm transition-all duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer flex items-center gap-3.5 border-0"
                      >
                        <User className="h-4 w-4 shrink-0 text-inherit" />
                        <span>Dados Pessoais</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="responsaveis"
                        className="w-full justify-start h-11 px-4 rounded-[18px] font-semibold text-sm transition-all duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer flex items-center gap-3.5 border-0"
                      >
                        <Users className="h-4 w-4 shrink-0 text-inherit" />
                        <span>Responsáveis</span>
                      </TabsTrigger>
                      {canManageContracts && (
                        <TabsTrigger
                          value="contrato"
                          className="w-full justify-start h-11 px-4 rounded-[18px] font-semibold text-sm transition-all duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer flex items-center gap-3.5 border-0"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-inherit" />
                          <span>Contrato</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="ausencias"
                        className="w-full justify-start h-11 px-4 rounded-[18px] font-semibold text-sm transition-all duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer flex items-center gap-3.5 border-0"
                      >
                        <CalendarClock className="h-4 w-4 shrink-0 text-inherit" />
                        <span>Ausências</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <div className="col-span-8 space-y-5">
                  {renderYearAndRenewalHeader()}
                  {renderTabContents()}
                </div>
              </div>
            </Tabs>
          )}
        </div>
      </PullToRefreshWrapper>

      {/* {shouldShowTutorial && (
        <VideoCommerce
          screenName="carteirinha"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_CARTEIRINHA_DISMISSED}
        />
      )} */}
    </>
  );
}
