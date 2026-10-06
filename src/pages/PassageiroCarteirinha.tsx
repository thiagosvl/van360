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


import { CarteirinhaSkeleton } from "@/components/skeletons";

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
import { CalendarClock, FileText, User, Users, Wallet } from "lucide-react";

import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog, useCobrancasByPassageiro,
  useCreateCobranca,
  useDeleteCobranca,
  useDeletePassageiro,
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
import { CobrancaStatus, ContratoStatus, PassageiroFormModes } from "@/types/enums";
import { useQueryClient } from "@tanstack/react-query";

import { openBrowserLink } from "@/utils/browser";
import { toast } from "@/utils/notifications/toast";
import { buildReciboWhatsAppMessage, buildContratoWhatsAppUrl } from "@/utils/whatsappTemplates";

import { Cobranca } from "@/types/cobranca";

import { Passageiro } from "@/types/passageiro";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { getNowBR, getStartOfDayBR, parseLocalDate } from "@/utils/dateUtils";
import { obterUrlDocumentoContrato, isPassageiroIncompleto } from "@/utils/domain";
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

  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (val: string) => {
    setActiveTabState(val);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("tab", val);
      return updated;
    });
  };

  useEffect(() => {
    if (activeTab) {
      const timer = setTimeout(() => {
        const container = tabListRef.current?.parentElement;
        const activeEl = tabListRef.current?.querySelector(`[data-state="active"]`) as HTMLElement | null;
        if (container && activeEl) {
          const left = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
          container.scrollTo({ left, behavior: "smooth" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
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
    toggleAtivoPassageiro.isPending ||
    createCobranca.isPending ||
    updateCobranca.isPending ||
    deleteCobranca.isPending ||
    desfazerPagamento.isPending ||
    toggleNotificacoes.isPending ||
    isDeleting;

  const [isCopiedEndereco, setIsCopiedEndereco] = useState(false);
  const [isCopiedTelefone, setIsCopiedTelefone] = useState(false);

  const [yearFilter, setYearFilter] = useState(currentYear);
  const hasSetInitialYear = useRef(false);

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

  const passageiro = passageiroData as Passageiro;

  useEffect(() => {
    if (passageiro?.ano_letivo && !hasSetInitialYear.current) {
      hasSetInitialYear.current = true;
      setYearFilter(passageiro.ano_letivo.toString());
    }
  }, [passageiro?.ano_letivo]);

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
    const rawData: Partial<Passageiro> = data
      ? ("passageiro" in data && data.passageiro ? data.passageiro : data)
      : {};
    const updatedPassageiro: Passageiro = {
      ...passageiro,
      ...rawData,
      status_contrato: rawData.status_contrato ?? passageiro?.status_contrato,
      contrato_id: rawData.contrato_id ?? passageiro?.contrato_id,
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

    if (isEligibleForFirstCharge && !hasCurrentMonthRealCharge) {
      setTimeout(() => {
        openFirstChargeDialog({
          passageiro: updatedPassageiro,
        });
      }, 300);
      return;
    }

    const hasChanges = meta?.hasCriticalContractChanges === true;
    const usarContratos = !!profile?.config_contrato?.usar_contratos;

    if (hasChanges && usarContratos) {
      setTimeout(() => {
        const hasActiveContract = updatedPassageiro.status_contrato === ContratoStatus.ASSINADO ||
          updatedPassageiro.status_contrato === ContratoStatus.PENDENTE;

        const hasNomeResp = !!(updatedPassageiro.responsavel_principal?.nome);
        const hasCpf = !!(updatedPassageiro.responsavel_principal?.cpf);
        const hasInicio = !!(updatedPassageiro.data_inicio_transporte);
        const hasFim = !!(updatedPassageiro.data_fim_transporte);

        if (hasNomeResp && hasCpf && hasInicio && hasFim) {
          openConfirmarGerarContratoDialog({
            passageiro: updatedPassageiro,
            valorMensal: updatedPassageiro.valor_cobranca ? Number(updatedPassageiro.valor_cobranca) : undefined,
            diaVencimento: updatedPassageiro.dia_vencimento ? Number(updatedPassageiro.dia_vencimento) : undefined,
            isSubstituicao: hasActiveContract,
            contratoIdParaSubstituir: updatedPassageiro.contrato_id || undefined,
          });
          return;
        }

        openGerarContratoValidadorDialog({
          passageiroId: updatedPassageiro.id!,
          initialPassageiro: updatedPassageiro,
          onSuccess: (_id, _bypassed, updatedValues) => {
            const valorMensal = updatedValues?.valorMensal ?? (updatedPassageiro.valor_cobranca ? Number(updatedPassageiro.valor_cobranca) : undefined);
            const diaVencimento = updatedValues?.diaVencimento ?? (updatedPassageiro.dia_vencimento ? Number(updatedPassageiro.dia_vencimento) : undefined);

            openConfirmarGerarContratoDialog({
              passageiro: updatedPassageiro,
              valorMensal,
              diaVencimento,
              isSubstituicao: hasActiveContract,
              contratoIdParaSubstituir: updatedPassageiro.contrato_id || undefined,
            });
          },
        });
      }, 300);
    }
  }, [passageiro, cobrancas, openFirstChargeDialog, openGerarContratoValidadorDialog, openConfirmarGerarContratoDialog, profile?.config_contrato?.usar_contratos]);

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

    const token = passageiro.token_acesso || passageiro.id;
    const finalLink = `${BASE_DOMAIN}/assinar/${token}`;

    if (!isMobile) {
      navigator.clipboard.writeText(finalLink);
      toast.success("Link para assinatura copiado!");
      return;
    }

    const telefone = passageiro.responsavel_principal?.telefone;

    if (!telefone) {
      toast.error("Telefone do responsável não informado.");
      return;
    }

    openBrowserLink(
      buildContratoWhatsAppUrl({
        telefoneResponsavel: telefone,
        nomeResponsavel: passageiro.responsavel_principal?.nome || "",
        nomePassageiro: passageiro.nome,
        link: finalLink,
      })
    );
  }, [passageiro, isMobile]);

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

  const cobrancasProps = {
    cobrancas,
    passageiro,
    yearFilter,
    onYearFilterChange: setYearFilter,
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
        ano: ano ?? Number(yearFilter) ?? undefined,
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
          title: "Valor da parcela não configurado",
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
    contratosAtivos: !!profile?.config_contrato?.usar_contratos,
    onDeleteClick: () =>
      openConfirmationDialog({
        title: "Excluir aluno?",
        description:
          "Tem certeza que deseja excluir este aluno? Esta ação excluirá permanentemente o cadastro e todos os dados do aluno.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          if (!passageiro_id) return;
          setIsDeleting(true);
          try {
            isDeletedRef.current = true;
            await deletePassageiro.mutateAsync(passageiro_id);
            safeCloseDialog(closeConfirmationDialog);
            navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS, { replace: true });
          } catch (error) {
            isDeletedRef.current = false;
            safeCloseDialog(closeConfirmationDialog);
          } finally {
            if (!isDeletedRef.current) {
              setIsDeleting(false);
            }
          }
        },
      }),
    onToggleNotificacoesClick: () => {
      const isAtivo = !!passageiro.enviar_notificacoes;
      const action = isAtivo ? "desativar" : "ativar";
      openConfirmationDialog({
        title: action === "ativar" ? "Ativar notificações?" : "Desativar notificações?",
        description: action === "ativar"
          ? "O responsável do aluno voltará a receber lembretes e notificações de cobrança."
          : "O responsável do aluno não receberá mais lembretes e notificações de cobrança.",
        confirmText: action === "ativar" ? "Ativar" : "Desativar",
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
        const hasNomeResp = !!(passageiro.responsavel_principal?.nome);
        const hasCpf = !!(passageiro.responsavel_principal?.cpf);
        const hasInicio = !!(passageiro.data_inicio_transporte);
        const hasFim = !!(passageiro.data_fim_transporte);

        if (hasNomeResp && hasCpf && hasInicio && hasFim) {
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
          onSuccess: (_id, _bypassed, updatedValues) => {
            const valorMensal = updatedValues?.valorMensal ?? (passageiro.valor_cobranca ? Number(passageiro.valor_cobranca) : undefined);
            const diaVencimento = updatedValues?.diaVencimento ?? (passageiro.dia_vencimento ? Number(passageiro.dia_vencimento) : undefined);

            openConfirmarGerarContratoDialog({
              passageiro,
              valorMensal,
              diaVencimento,
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
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2rem]" />}>
            <CarteirinhaCobrancas {...cobrancasProps} />
          </Suspense>
        </TabsContent>
      )}

      <TabsContent value="dados-pessoais" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
          <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-6">
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

        <Suspense fallback={<Skeleton className="h-32 w-full rounded-[2rem]" />}>
          <CarteirinhaObservacoes {...observacoesProps} />
        </Suspense>
      </TabsContent>

      <TabsContent value="responsaveis" className={cn("outline-none space-y-5 transform-gpu will-change-transform", extraClassName)}>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
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
          <Suspense fallback={<Skeleton className="h-32 w-full rounded-[2rem]" />}>
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
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-[2rem]" />}>
          <CarteirinhaAusencias
            passageiro={passageiro}
            temRotas={temRotas}
            isRotasLoading={isRotasLoading}
          />
        </Suspense>
      </TabsContent>
    </>
  );

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          {isMobile ? (
            <>
              <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
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

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar bg-slate-200/50 p-1 rounded-[1.25rem]">
                  <TabsList
                    ref={tabListRef}
                    className={cn(
                      "flex min-w-full w-max md:w-full min-h-[44px] bg-transparent p-0 gap-1 text-[13px] md:grid",
                      validTabs.length === 5 && "md:grid-cols-5",
                      validTabs.length === 4 && "md:grid-cols-4",
                      validTabs.length === 3 && "md:grid-cols-3",
                      validTabs.length === 2 && "md:grid-cols-2"
                    )}
                  >
                    {canViewFinancials && (
                      <TabsTrigger
                        value="parcelas"
                        className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                      >
                        Parcelas
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="dados-pessoais"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger
                      value="responsaveis"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Responsáveis
                    </TabsTrigger>
                    {canManageContracts && (
                      <TabsTrigger
                        value="contrato"
                        className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                      >
                        Contrato
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="ausencias"
                      className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                    >
                      Ausências
                    </TabsTrigger>
                  </TabsList>
                </div>

                {renderTabContents("mt-5")}
              </Tabs>
            </>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-4 space-y-6 sticky top-6">
                  <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
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

                  <div className="bg-slate-200/50 p-2 rounded-[2rem] shadow-xs">
                    <TabsList className="flex flex-col w-full bg-transparent p-0 gap-1 h-auto">
                      {canViewFinancials && (
                        <TabsTrigger
                          value="parcelas"
                          className="w-full justify-start rounded-2xl h-11 px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer flex items-center gap-3"
                        >
                          <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>Parcelas</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="dados-pessoais"
                        className="w-full justify-start rounded-2xl h-11 px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer flex items-center gap-3"
                      >
                        <User className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Dados Pessoais</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="responsaveis"
                        className="w-full justify-start rounded-2xl h-11 px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer flex items-center gap-3"
                      >
                        <Users className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Responsáveis</span>
                      </TabsTrigger>
                      {canManageContracts && (
                        <TabsTrigger
                          value="contrato"
                          className="w-full justify-start rounded-2xl h-11 px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer flex items-center gap-3"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>Contrato</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="ausencias"
                        className="w-full justify-start rounded-2xl h-11 px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer flex items-center gap-3"
                      >
                        <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Ausências</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <div className="col-span-8 space-y-6">
                  {renderTabContents()}
                </div>
              </div>
            </Tabs>
          )}
        </div>
      </PullToRefreshWrapper>

      {shouldShowTutorial && (
        <VideoCommerce
          screenName="carteirinha"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_CARTEIRINHA_DISMISSED}
        />
      )}
    </>
  );
}
