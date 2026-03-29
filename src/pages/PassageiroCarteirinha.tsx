import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { ROUTES } from "@/constants/routes";
import { useNavigate, useParams } from "react-router-dom";


import { CarteirinhaSkeleton } from "@/components/skeletons";

import {
  CarteirinhaCobrancas,
  CarteirinhaDadosPessoais,
  CarteirinhaHeader,
  CarteirinhaInfo,
  CarteirinhaObservacoes
} from "@/components/features/passageiro/carteirinha";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog, useCobrancasByPassageiro,
  useDeleteCobranca,
  useDeletePassageiro,
  useDesfazerPagamento,
  useEnviarNotificacaoCobranca, useIsMobile, usePassageiro,
  useToggleAtivoPassageiro,
  useToggleNotificacoesCobranca,
  useUpdateCobranca,
  useUpdatePassageiro
} from "@/hooks";
import { useCreateContrato } from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { CobrancaStatus, ContratoStatus, PassageiroFormModes } from "@/types/enums";
import { useQueryClient } from "@tanstack/react-query";

import { openBrowserLink } from "@/utils/browser";
import { toast } from "@/utils/notifications/toast";

import { Cobranca } from "@/types/cobranca";

import { Passageiro } from "@/types/passageiro";

const currentYear = new Date().getFullYear().toString();

export default function PassageiroCarteirinha() {
  const navigate = useNavigate();
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
    openUpdateContractDialog,
    openGenerateContractDialog,
  } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();

  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileTab, setMobileTab] = useState("dados");

  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();
  const updateCobranca = useUpdateCobranca();
  const deleteCobranca = useDeleteCobranca();
  const enviarNotificacao = useEnviarNotificacaoCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const createContrato = useCreateContrato();

  const isActionLoading =
    createContrato.isPending ||
    updatePassageiro.isPending ||
    deletePassageiro.isPending ||
    toggleAtivoPassageiro.isPending ||
    updateCobranca.isPending ||
    deleteCobranca.isPending ||
    enviarNotificacao.isPending ||
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
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

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



  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    isFetching: isCobrancasFetching,
    refetch: refetchCobrancas,
    isError: isCobrancasError,
  } = useCobrancasByPassageiro(passageiro_id, yearFilter, {
    enabled: !!passageiro_id,
  });

  const cobrancas = (cobrancasData || []) as Cobranca[];

  const availableYears = [currentYear];

  const loading =
    isSessionLoading ||
    isProfileLoading ||
    isPassageiroLoading ||
    isCobrancasLoading;


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
    refetchPassageiro();

    const hasChanges = meta?.hasCriticalContractChanges === true;
    const usarContratos = profile?.config_contrato?.usar_contratos;

    if (hasChanges && usarContratos) {
      const updatedPassageiro = data?.id ? data : (data?.passageiro || passageiro);

      setTimeout(() => {
        const hasActiveContract = updatedPassageiro.status_contrato === ContratoStatus.ASSINADO ||
          updatedPassageiro.status_contrato === ContratoStatus.PENDENTE;

        if (hasActiveContract) {
          openUpdateContractDialog({ passageiro: updatedPassageiro });
        } else {
          openGenerateContractDialog({ passageiro: updatedPassageiro });
        }
      }, 400);
    }
  }, [refetchPassageiro, passageiro, openUpdateContractDialog, openGenerateContractDialog, profile?.config_contrato?.usar_contratos]);

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
        action === "ativar" ? "Reativar passageiro?" : "Desativar passageiro?",
      description:
        action === "ativar"
          ? "O passageiro voltará a aparecer nas listagens de passageiros ativos e as mensalidades dele voltarão a ser geradas automaticamente."
          : "O passageiro ficará inativo e as mensalidades dele não serão mais geradas automaticamente. Você poderá reativá-lo depois.",
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

  const handleToggleLembretes = useCallback(
    async (cobranca: Cobranca) => {
      toggleNotificacoes.mutate({
        cobrancaId: cobranca.id,
        desativar: !cobranca.desativar_lembretes,
      });
    },
    [toggleNotificacoes],
  );


  const handleEnviarNotificacaoClick = useCallback(
    (cobrancaId: string) => {
      openConfirmationDialog({
        title: "Cobrar via WhatsApp",
        description:
          "A cobrança será enviada para o responsável (WhatsApp ou Email). Confirmar?",
        confirmText: "Confirmar",
        onConfirm: async () => {
          try {
            await enviarNotificacao.mutateAsync(cobrancaId);
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [enviarNotificacao, closeConfirmationDialog],
  );

  const handleDesfazerClick = useCallback(
    (cobrancaId: string) => {
      openConfirmationDialog({
        title: "Desfazer pagamento?",
        description:
          "O pagamento será removido e a mensalidade voltará a ficar pendente. Confirmar?",
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
          try {
            await deleteCobranca.mutateAsync(cobranca.id);
          } catch (error) {
            throw error;
          }
        },
        onEdit: () => {
          openCobrancaEditDialog({
            cobranca,
            onSuccess: refetchCobrancas,
          });
        }
      });
    },
    [deleteCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, refetchCobrancas]
  );

  const openPaymentDialog = (cobranca: Cobranca) => {
    openManualPaymentDialog({
      cobrancaId: cobranca.id,
      passageiroNome: passageiro.nome,
      responsavelNome: passageiro.nome_responsavel,
      valorOriginal: Number(cobranca.valor),
      status: cobranca.status,
      dataVencimento: cobranca.data_vencimento,
      onPaymentRecorded: refetchCobrancas,
    });
  };

  const temCobrancasVencidas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.some(
      (c) =>
        c.status !== CobrancaStatus.PAGO && new Date(c.data_vencimento) < hoje,
    );
  }, [cobrancas]);

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
    ]);
  };

  const cobrancasProps = {
    cobrancas,
    passageiro,
    yearFilter,
    mostrarTodasCobrancas,
    limiteCobrancasMobile: 3,
    onOpenCobrancaDialog: () => {
      if (!passageiro_id) return;
      openCobrancaFormDialog({
        passageiroId: passageiro_id,
        passageiroNome: passageiro?.nome,
        passageiroResponsavelNome: passageiro?.nome_responsavel,
        valorCobranca: Number(passageiro?.valor_cobranca),
        diaVencimento: Number(passageiro?.dia_vencimento),
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
    onEnviarNotificacao: handleEnviarNotificacaoClick,
    onToggleLembretes: handleToggleLembretes,
    onDesfazerPagamento: handleDesfazerClick,
    onExcluirCobranca: handleExcluirCobranca,
    onToggleClick: handleToggleClick,
  };

  const infoProps = {
    passageiro,
    temCobrancasVencidas,
    isCopiedEndereco,
    isCopiedTelefone,
    onEditClick: handleEditClick,
    onCopyToClipboard: handleCopyToClipboard,
    onToggleClick: handleToggleClick,
    contratosAtivos: profile?.config_contrato?.usar_contratos !== false,
    onDeleteClick: () =>
      openConfirmationDialog({
        title: "Excluir passageiro?",
        description:
          "Tem certeza que deseja excluir este passageiro? Essa ação não poderá ser desfeita.",
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
    onContractAction: () => {
      if (!passageiro || !passageiro_id) return;

      if (
        passageiro.status_contrato === ContratoStatus.PENDENTE ||
        passageiro.status_contrato === ContratoStatus.ASSINADO
      ) {
        const url =
          passageiro.status_contrato === ContratoStatus.ASSINADO
            ? passageiro.contrato_final_url || passageiro.contrato_url
            : passageiro.minuta_url || passageiro.contrato_url;

        if (url) {
          openBrowserLink(url);
        } else {
          toast.error("contrato.erro.semUrl", {
            description: "Link do contrato não disponível.",
          });
        }
        return;
      }

      if (passageiro.contrato_id) {
        openUpdateContractDialog({ passageiro });
      } else {
        openGenerateContractDialog({ passageiro });
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
            {/* Mobile Layout: Header fixo + Abas na primeira dobra */}
            {isMobile ? (
              <div className="space-y-5">
                {/* Header do passageiro (avatar, nome, badges, ações) — sempre visível */}
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
                  <CarteirinhaHeader
                    passageiro={passageiro}
                    temCobrancasVencidas={temCobrancasVencidas}
                    onToggleClick={handleToggleClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={infoProps.onDeleteClick}
                  />
                </Suspense>

                {/* Abas: Dados Pessoais / Mensalidades — logo na primeira dobra */}
                <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
                  <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
                    <TabsList className="grid grid-cols-2 w-full h-[52px] bg-transparent p-0 gap-1 text-[13px]">
                      <TabsTrigger
                        value="dados"
                        className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80"
                      >
                        Dados Pessoais
                      </TabsTrigger>
                      <TabsTrigger
                        value="mensalidades"
                        className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80"
                      >
                        Mensalidades
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="dados" className="mt-5 outline-none space-y-5">
                    {/* Dados pessoais detalhados */}
                    <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
                      <CarteirinhaDadosPessoais
                        passageiro={passageiro}
                        isCopiedEndereco={isCopiedEndereco}
                        isCopiedTelefone={isCopiedTelefone}
                        onCopyToClipboard={handleCopyToClipboard}
                        onContractAction={infoProps.onContractAction}
                        contratosAtivos={infoProps.contratosAtivos}
                      />
                    </Suspense>

                    {/* Observações no final da aba dados */}
                    <Suspense fallback={<Skeleton className="h-32 w-full rounded-[2rem]" />}>
                      <CarteirinhaObservacoes {...observacoesProps} />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="mensalidades" className="mt-5 outline-none">
                    <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2rem]" />}>
                      <CarteirinhaCobrancas {...cobrancasProps} />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              /* Desktop Layout: Side by Side */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lado Esquerdo: Perfil + Observações */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 lg:h-fit">
                  <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2rem]" />}>
                    <CarteirinhaInfo {...infoProps} />
                  </Suspense>

                  <Suspense fallback={<Skeleton className="h-32 w-full rounded-[2rem]" />}>
                    <CarteirinhaObservacoes {...observacoesProps} />
                  </Suspense>
                </div>

                {/* Lado Direito: Mensalidades */}
                <div className="lg:col-span-8">
                  <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2rem]" />}>
                    <CarteirinhaCobrancas {...cobrancasProps} />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
}
