import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { ROUTES } from "@/constants/routes";
import { useNavigate, useParams } from "react-router-dom";

import CobrancaDialog from "@/components/dialogs/CobrancaDialog";

import { CarteirinhaSkeleton } from "@/components/skeletons";

import { lazyLoad } from "@/utils/lazyLoad";

const CarteirinhaInfo = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaInfo,
  })),
);
const CarteirinhaCobrancas = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaCobrancas,
  })),
);
const CarteirinhaObservacoes = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaObservacoes,
  })),
);
const CarteirinhaResumoFinanceiro = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaResumoFinanceiro,
  })),
);

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Skeleton } from "@/components/ui/skeleton";

import { useLayout } from "@/contexts/LayoutContext";
import {
    useAvailableYears,
    useCobrancasByPassageiro,
    useDeleteCobranca,
    useDeletePassageiro,
    useDesfazerPagamento,
    useEnviarNotificacaoCobranca,
    usePassageiro,
    useToggleAtivoPassageiro,
    useToggleNotificacoesCobranca,
    useUpdateCobranca,
    useUpdatePassageiro
} from "@/hooks";
import { useCreateContrato } from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { ContratoStatus } from "@/types/enums";
import { useQueryClient } from "@tanstack/react-query";

import { openBrowserLink } from "@/utils/browser";
import { toast } from "@/utils/notifications/toast";

import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus, PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";

const currentYear = new Date().getFullYear().toString();
const COBRANCAS_LIMIT = 3;

export default function PassageiroCarteirinha() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openManualPaymentDialog,
  } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();

  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [yearFilter, setYearFilter] = useState(currentYear);

  const [isObservacoesEditing, setIsObservacoesEditing] = useState(false);
  const [obsText, setObsText] = useState("");
  const [mostrarTodasCobrancas, setMostrarTodasCobrancas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const {
    data: availableYearsData,
    refetch: refetchAvailableYears,
    isError: isAvailableYearsError,
  } = useAvailableYears(passageiro_id, {
    enabled: !!passageiro_id,
  });

  const availableYears = (availableYearsData || [currentYear]) as string[];

  const loading =
    isSessionLoading ||
    isProfileLoading ||
    isPassageiroLoading ||
    isCobrancasLoading;

  useEffect(() => {
    if (isAvailableYearsError) {
      toast.error("cobranca.erro.buscarAnos", {
        description: "Não foi possível concluir a operação.",
      });
    }
  }, [isAvailableYearsError]);

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
    if (isObservacoesEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      const length = textarea.value.length;

      textarea.focus();

      textarea.setSelectionRange(length, length);
    }
  }, [isObservacoesEditing]);

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

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(yearFilter)) {
      const fallbackYear = new Date().getFullYear().toString();
      setYearFilter(fallbackYear);
    }
  }, [availableYears, yearFilter]);

  const handlePassageiroFormSuccess = useCallback(() => {
    refetchPassageiro();
  }, [refetchPassageiro]);

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
          ? "O passageiro voltará a aparecer nas listagens ativas e a geração de mensalidades será retomada."
          : "O passageiro ficará inativo e a geração de mensalidades será pausada. Você poderá reativá-lo depois.",
      confirmText: action === "ativar" ? "Reativar" : "Desativar",
      variant: action === "desativar" ? "warning" : "default",
      onConfirm: async () => {
        if (!passageiro || !passageiro_id) return;
        try {
            await toggleAtivoPassageiro.mutateAsync({
                id: passageiro_id,
                novoStatus: !passageiro.ativo,
            });
            closeConfirmationDialog();
        } catch (error) {
            closeConfirmationDialog();
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
            closeConfirmationDialog();
          } catch (error) {
            closeConfirmationDialog();
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
            closeConfirmationDialog();
          } catch (error) {
            closeConfirmationDialog();
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

  const yearlySummary = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.reduce(
      (acc, c) => {
        if (c.status === CobrancaStatus.PAGO) {
          acc.valorPago += Number(c.valor);
          acc.qtdPago++;
        } else {
          const vencimento = new Date(c.data_vencimento + "T00:00:00");
          vencimento.setHours(0, 0, 0, 0);

          if (vencimento < hoje) {
            acc.qtdEmAtraso += 1;
            acc.valorEmAtraso += Number(c.valor);
          } else {
            acc.qtdPendente++;
            acc.valorPendente += Number(c.valor);
          }
        }
        return acc;
      },
      {
        qtdPago: 0,
        valorPago: 0,
        qtdPendente: 0,
        valorPendente: 0,
        qtdEmAtraso: 0,
        valorEmAtraso: 0,
      },
    );
  }, [cobrancas]);

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
      refetchAvailableYears(),
    ]);
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="min-h-screen">
          <div className=" space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="contents lg:block lg:col-span-4 lg:space-y-6 lg:sticky lg:top-6 lg:h-fit">
                <div className="order-1 lg:order-none">
                  <Suspense
                    fallback={<Skeleton className="h-96 w-full rounded-2xl" />}
                  >
                    <CarteirinhaInfo
                      passageiro={passageiro}
                      temCobrancasVencidas={temCobrancasVencidas}
                      isCopiedEndereco={isCopiedEndereco}
                      isCopiedTelefone={isCopiedTelefone}
                      onEditClick={handleEditClick}
                      onCopyToClipboard={handleCopyToClipboard}

                      onToggleClick={handleToggleClick}
                      onDeleteClick={() =>
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
                              closeConfirmationDialog();
                              navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS);
                            } catch (error) {
                            } finally {
                              setIsDeleting(false);
                            }
                          },
                        })
                      }
                       onContractAction={() => {
                          if (!passageiro || !passageiro_id) return;
                          
                          if (passageiro.status_contrato === ContratoStatus.PENDENTE || passageiro.status_contrato === ContratoStatus.ASSINADO) {
                              const url = passageiro.status_contrato === ContratoStatus.ASSINADO 
                                ? (passageiro.contrato_final_url || passageiro.contrato_url)
                                : passageiro.contrato_url;

                              if (url) {
                                  openBrowserLink(url);
                              } else {
                                  toast.error("contrato.erro.semUrl", {
                                      description: "contrato.erro.semUrlDescricao"
                                  });
                              }
                              return;
                          }

                          openConfirmationDialog({
                              title: "Gerar Contrato?",
                              description: `Deseja gerar um novo contrato para ${passageiro.nome}? Isso usará a configuração atual de contrato.`,
                              confirmText: "Gerar Contrato",
                              onConfirm: async () => {
                                  if (!passageiro || !passageiro_id) return;
                                  
                                  try {
                                      await createContrato.mutateAsync({
                                          passageiroId: passageiro.id,
                                          modalidade: passageiro.periodo,
                                          valorMensal: Number(passageiro.valor_cobranca),
                                          diaVencimento: Number(passageiro.dia_vencimento),
                                      });
                                      closeConfirmationDialog();
                                  } catch (error) {
                                      closeConfirmationDialog();
                                  }
                              }
                          });
                       }}
                    />
                  </Suspense>
                </div>

                <div className="order-4 lg:order-none">
                  <Suspense
                    fallback={<Skeleton className="h-48 w-full rounded-2xl" />}
                  >
                    <CarteirinhaObservacoes
                      obsText={obsText}
                      isEditing={isObservacoesEditing}
                      textareaRef={textareaRef}
                      onStartEditing={() => setIsObservacoesEditing(true)}
                      onTextChange={setObsText}
                      onSave={handleSaveObservacoes}
                      onCancel={() => {
                        setObsText(passageiro?.observacoes || "");
                        setIsObservacoesEditing(false);
                      }}
                    />
                  </Suspense>
                </div>
              </div>

              <div className="contents lg:block lg:col-span-8 lg:space-y-6">
                <div className="order-3 lg:order-none">
                  <Suspense
                    fallback={<Skeleton className="h-48 w-full rounded-2xl" />}
                  >
                    <CarteirinhaResumoFinanceiro
                      yearlySummary={yearlySummary}
                    />
                  </Suspense>
                </div>

                <div className="order-2 lg:order-none" id="cobrancas-section">
                  <Suspense
                    fallback={<Skeleton className="h-96 w-full rounded-2xl" />}
                  >
                    <CarteirinhaCobrancas
                      cobrancas={cobrancas}
                      passageiro={passageiro}
                      yearFilter={yearFilter}
                      availableYears={availableYears}
                      mostrarTodasCobrancas={mostrarTodasCobrancas}
                      limiteCobrancasMobile={COBRANCAS_LIMIT}
                      onYearChange={setYearFilter}
                      onOpenCobrancaDialog={() => setCobrancaDialogOpen(true)}
                      onNavigateToCobranca={(id) =>
                        navigate(
                           ROUTES.PRIVATE.MOTORISTA.PASSENGER_BILLING.replace(
                            ":cobranca_id",
                            id,
                           ),
                        )
                      }
                      onEditCobranca={(cobranca) => {
                        openCobrancaEditDialog({
                          cobranca,
                          onSuccess: refetchCobrancas,
                        });
                      }}
                      onRegistrarPagamento={(cobranca) => {
                        openPaymentDialog(cobranca);
                      }}

                      onEnviarNotificacao={handleEnviarNotificacaoClick}
                      onToggleLembretes={handleToggleLembretes}
                      onDesfazerPagamento={handleDesfazerClick}
                      onExcluirCobranca={handleExcluirCobranca}
                      onToggleClick={handleToggleClick}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />

      <CobrancaDialog
        isOpen={cobrancaDialogOpen}
        onClose={() => setCobrancaDialogOpen(false)}
        passageiroId={passageiro_id}
        passageiroNome={passageiro?.nome}
        passageiroResponsavelNome={passageiro?.nome_responsavel}
        valorCobranca={Number(passageiro?.valor_cobranca)}
        diaVencimento={Number(passageiro?.dia_vencimento)}
      />
    </>
  );
}
