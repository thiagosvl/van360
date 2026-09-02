import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { ROUTES } from "@/constants/routes";
import { BASE_DOMAIN } from "@/constants";
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

import { PixNudgeBanner } from "@/components/features/subscription/PixNudgeBanner";
import { IncompletePassengerBanner } from "@/components/features/passageiro/IncompletePassengerBanner";
import { isCadastroPassageiroIncompleto, obterUrlDocumentoContrato } from "@/utils/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { CobrancaStatus, ContratoStatus, PassageiroFormModes } from "@/types/enums";
import { useQueryClient } from "@tanstack/react-query";

import { openBrowserLink } from "@/utils/browser";
import { toast } from "@/utils/notifications/toast";

import { Cobranca } from "@/types/cobranca";

import { Passageiro } from "@/types/passageiro";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { buildContratoWhatsAppUrl } from "@/utils/evolution";
import { getNowBR, getStartOfDayBR, parseLocalDate } from "@/utils/dateUtils";

const currentYear = getNowBR().getFullYear().toString();

import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { cn } from "@/lib/utils";

export default function PassageiroCarteirinha() {
  const navigate = useNavigate();
  const { can, isSubConta } = usePermissions();
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
  } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();

  const canViewFinancials = can("financeiro.visualizar") || can("cobrancas.gerenciar") || can("passageiros.cobranca_visualizar") || can("passageiros.gerenciar");
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = useMemo(() => {
    return canViewFinancials
      ? ["parcelas", "dados-pessoais", "responsaveis", "contrato", "ausencias"]
      : ["dados-pessoais", "responsaveis", "contrato", "ausencias"];
  }, [canViewFinancials]);

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
    setTimeout(() => {
      const activeEl = tabListRef.current?.querySelector(`[data-state="active"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }, 50);
  };

  useEffect(() => {
    if (activeTab) {
      setTimeout(() => {
        const activeEl = tabListRef.current?.querySelector(`[data-state="active"]`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 100);
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

  const [yearFilter] = useState(currentYear);

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
    enabled: !!passageiro_id,
  });

  const passageiro = passageiroData as Passageiro;

  const totalPassageiros = summary?.contadores?.passageiros?.total ?? 0;



  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    isFetching: isCobrancasFetching,
    refetch: refetchCobrancas,
    isError: isCobrancasError,
  } = useCobrancasByPassageiro(passageiro_id, yearFilter, {
    enabled: !!passageiro_id && canViewFinancials,
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
    if (!passageiro_id) return;

    if (isPassageiroLoading) return;
    if (isDeleting) return;

    const isNotFoundError =
      isPassageiroError &&
      ((passageiroError as any)?.response?.status === 404 ||
        (passageiroError as any)?.status === 404);

    if (isNotFoundError || (!isPassageiroError && !passageiro)) {
      queryClient.removeQueries({ queryKey: ["passageiro", passageiro_id] });
      queryClient.removeQueries({
        queryKey: ["cobrancas-by-passageiro", passageiro_id],
      });
      queryClient.removeQueries({
        queryKey: ["available-years", passageiro_id],
      });

      navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS, { replace: true });
    }
  }, [
    isPassageiroLoading,
    isPassageiroError,
    passageiroError,
    passageiro,
    passageiro_id,
    navigate,
    queryClient,
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
  const handlePassageiroFormSuccess = useCallback((data?: any, meta?: any) => {
    const hasChanges = meta?.hasCriticalContractChanges === true;
    const usarContratos = !!profile?.config_contrato?.usar_contratos;

    if (hasChanges && usarContratos) {
      const updatedPassageiro = data?.id ? data : (data?.passageiro || passageiro);

      setTimeout(() => {
        const hasActiveContract = updatedPassageiro.status_contrato === ContratoStatus.ASSINADO ||
          updatedPassageiro.status_contrato === ContratoStatus.PENDENTE;

        const firstName = formatFirstName(updatedPassageiro.nome);

        openConfirmationDialog({
          title: hasActiveContract ? "Substituir contrato?" : "Gerar contrato?",
          description: hasActiveContract
            ? `Você alterou dados importantes do aluno. Deseja gerar um novo contrato com as informações atualizadas? O responsável receberá um link para assiná-lo.`
            : `Deseja gerar um contrato para ${firstName}? O responsável receberá um link para assiná-lo.`,
          confirmText: hasActiveContract ? "Substituir" : "Gerar",
          cancelText: hasActiveContract ? "Manter atual" : "Não gerar",
          onConfirm: async () => {
            try {
              if (updatedPassageiro.contrato_id) {
                await substituirContrato.mutateAsync(updatedPassageiro.contrato_id);
              } else {
                await createContrato.mutateAsync({ passageiroId: updatedPassageiro.id! });
              }
              safeCloseDialog(closeConfirmationDialog);
            } catch {
              safeCloseDialog(closeConfirmationDialog);
            }
          },
        });
      }, 300);
    }
  }, [passageiro, openConfirmationDialog, closeConfirmationDialog, substituirContrato, createContrato, profile?.config_contrato?.usar_contratos]);

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
          refetchCobrancas();
        },
        onEdit: cobranca.isProjection ? undefined : () => {
          openCobrancaEditDialog({
            cobranca,
            onSuccess: refetchCobrancas,
          });
        }
      });
    },
    [deleteCobranca, createCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, refetchCobrancas, passageiro?.usuario_id, user?.id]
  );

  const openPaymentDialog = (cobranca: Cobranca) => {
    openManualPaymentDialog({
      cobrancaId: cobranca.id,
      passageiroNome: passageiro.nome,
      responsavelNome: passageiro.responsavel_principal?.nome || "",
      valorOriginal: Number(cobranca.valor),
      status: cobranca.status,
      dataVencimento: cobranca.data_vencimento,
      onPaymentRecorded: () => {
        refetchCobrancas();
      },
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
        ano,
        lockFoiPago,
        lockMesAno,
        availableMonths,
        onSuccess: refetchCobrancas,
      });
    },
    onEditCobranca: (cobranca: Cobranca) => {
      openCobrancaEditDialog({
        cobranca,
        onSuccess: refetchCobrancas,
      });
    },
    onRegistrarPagamento: (cobranca: Cobranca) => {
      openPaymentDialog(cobranca);
    },
    onToggleLembretes: handleToggleLembretes,
    onDesfazerPagamento: handleDesfazerClick,
    onExcluirCobranca: handleExcluirCobranca,
    onToggleClick: handleToggleClick,
    onVerRecibo: (url: string, cobranca: Cobranca) => openReceiptDialog({
      receiptUrl: url,
      cobrancaDescricao: `Recibo de ${cobranca.mes}/${cobranca.ano} - ${passageiro.nome}`,
    }),
    onActionSuccess: refetchCobrancas,
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
          "Tem certeza que deseja excluir este aluno? Esta ação excluirá permanentemente o cadastro e todos os dados associados (cobranças, contratos, rotas e históricos). Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          if (!passageiro_id) return;
          setIsDeleting(true);
          try {
            await deletePassageiro.mutateAsync(passageiro_id);
            safeCloseDialog(closeConfirmationDialog);
            navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          } finally {
            setIsDeleting(false);
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
        openGerarContratoValidadorDialog({
          passageiroId: passageiro.id!,
          onSuccess: (id, bypassed) => {
            if (bypassed) {
              openConfirmationDialog({
                title: "Gerar contrato?",
                description: `Deseja gerar o contrato para ${formatFirstName(passageiro.nome)}? O responsável receberá o link para assinatura.`,
                confirmText: "Gerar",
                onConfirm: async () => {
                  try {
                    await createContrato.mutateAsync({
                      passageiroId: id,
                      valorMensal: passageiro.valor_cobranca,
                      diaVencimento: passageiro.dia_vencimento
                    });
                    safeCloseDialog(closeConfirmationDialog);
                  } catch (error) {
                    safeCloseDialog(closeConfirmationDialog);
                  }
                },
              });
            } else {
              createContrato.mutateAsync({
                passageiroId: id,
                valorMensal: passageiro.valor_cobranca,
                diaVencimento: passageiro.dia_vencimento
              });
            }
          }
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

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div>
          <div className="space-y-6">
            {isCadastroPassageiroIncompleto(passageiro) ? (
              <IncompletePassengerBanner onEdit={handleEditClick} />
            ) : !isSubConta && !profile?.chave_pix && totalPassageiros > 1 ? (
              <PixNudgeBanner hasPix={false} />
            ) : null}

            {/* Header do passageiro (avatar, nome, badges, ações) — sempre visível no topo */}
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

            {/* Abas com Scroll Lateral no Mobile e Grid no Desktop */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="overflow-x-auto no-scrollbar bg-slate-200/50 p-1 rounded-[1.25rem]">
                <TabsList
                  ref={tabListRef}
                  className={cn(
                    "flex min-w-full w-max md:w-full min-h-[44px] bg-transparent p-0 gap-1 text-[13px]",
                    canViewFinancials ? "md:grid md:grid-cols-5" : "md:grid md:grid-cols-4"
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
                  <TabsTrigger
                    value="contrato"
                    className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                  >
                    Contrato
                  </TabsTrigger>
                  <TabsTrigger
                    value="ausencias"
                    className="rounded-[1rem] h-full min-h-[36px] px-3 md:px-4 font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 cursor-pointer text-center flex items-center justify-center"
                  >
                    Ausências
                  </TabsTrigger>
                </TabsList>
              </div>

              {canViewFinancials && (
                <TabsContent value="parcelas" className="mt-5 outline-none space-y-5 transform-gpu will-change-transform">
                  <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2rem]" />}>
                    <CarteirinhaCobrancas {...cobrancasProps} />
                  </Suspense>
                </TabsContent>
              )}

              <TabsContent value="dados-pessoais" className="mt-5 outline-none space-y-5 transform-gpu will-change-transform">
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

              <TabsContent value="responsaveis" className="mt-5 outline-none space-y-5 transform-gpu will-change-transform">
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
                  <CarteirinhaResponsaveis
                    passageiro={passageiro}
                    onEditClick={handleEditClick}
                    onRefresh={() => {
                      refetchPassageiro();
                    }}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="contrato" className="mt-5 outline-none space-y-5 transform-gpu will-change-transform">
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

              <TabsContent value="ausencias" className="mt-5 outline-none space-y-5 transform-gpu will-change-transform">
                <Suspense fallback={<Skeleton className="h-32 w-full rounded-[2rem]" />}>
                  <CarteirinhaAusencias passageiro={passageiro} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PullToRefreshWrapper>
    </>
  );
}
