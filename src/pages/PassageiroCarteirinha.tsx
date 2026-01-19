import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// React Router
import { useNavigate, useParams } from "react-router-dom";

// Components - Dialogs
import CobrancaDialog from "@/components/dialogs/CobrancaDialog";

// Components - Empty & Skeletons
import { CarteirinhaSkeleton } from "@/components/skeletons";

import { lazyLoad } from "@/utils/lazyLoad";

// Components - Features - Carteirinha (Lazy Loaded)
const CarteirinhaInfo = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaInfo,
  }))
);
const CarteirinhaCobrancas = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaCobrancas,
  }))
);
const CarteirinhaObservacoes = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaObservacoes,
  }))
);
const CarteirinhaResumoFinanceiro = lazyLoad(() =>
  import("@/components/features/passageiro/carteirinha").then((mod) => ({
    default: mod.CarteirinhaResumoFinanceiro,
  }))
);

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Skeleton } from "@/components/ui/skeleton";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
  useAvailableYears,
  useCobrancasByPassageiro,
  useDeleteCobranca,
  useDeletePassageiro,
  useDesfazerPagamento,
  useEnviarNotificacaoCobranca,
  usePassageiro,
  usePermissions,
  useToggleAtivoPassageiro,
  useToggleNotificacoesCobranca,
  useUpdateCobranca,
  useUpdatePassageiro
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useQueryClient } from "@tanstack/react-query";

// Utils
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";

// Types
import { FEATURE_COBRANCA_AUTOMATICA } from "@/constants";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";

const currentYear = new Date().getFullYear().toString();
const COBRANCAS_LIMIT = 3;

export default function PassageiroCarteirinha() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    setPageTitle, 
    openPlanUpgradeDialog, 
    openConfirmationDialog, 
    closeConfirmationDialog,
    openEscolaFormDialog,
    openVeiculoFormDialog,
    openPassageiroFormDialog,
    openCobrancaEditDialog,
    openCobrancaPixDrawer,
    openManualPaymentDialog
  } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();

  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);

  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();
  const updateCobranca = useUpdateCobranca();
  const deleteCobranca = useDeleteCobranca();
  const enviarNotificacao = useEnviarNotificacaoCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const toggleNotificacoes = useToggleNotificacoesCobranca();

  const isActionLoading =
    updatePassageiro.isPending ||
    deletePassageiro.isPending ||
    toggleAtivoPassageiro.isPending ||
    updateCobranca.isPending ||
    deleteCobranca.isPending ||
    enviarNotificacao.isPending ||
    desfazerPagamento.isPending ||
    toggleNotificacoes.isPending;
  const [isCopiedEndereco, setIsCopiedEndereco] = useState(false);
  const [isCopiedTelefone, setIsCopiedTelefone] = useState(false);
  
  // State for year filter
  const [yearFilter, setYearFilter] = useState(currentYear);


  


  const [isObservacoesEditing, setIsObservacoesEditing] = useState(false);
  const [obsText, setObsText] = useState("");
  const [mostrarTodasCobrancas, setMostrarTodasCobrancas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading } = useProfile(user?.id);
  const { canUseAutomatedCharges: canUseCobrancaAutomatica } = usePermissions();
  // const planoProfissionalAtivo = canUseCobrancaAutomatica(plano); // REMOVED

  // Hook para validar franquia (dados já carregados)
  // Passar user?.id (auth_uid) e profile para evitar chamadas duplicadas
  // Hook para validar franquia (dados já carregados)
  // Passar user?.id (auth_uid) e profile para evitar chamadas duplicadas
  const { limits } = usePlanLimits();

  const validacaoFranquiaGeral = {
    franquiaContratada: limits.franchise.limit,
    cobrancasEmUso: limits.franchise.used,
    podeAtivar: limits.franchise.canEnable
  };



  const handleUpgradeSuccess = () => {
    // Backend activates passenger via webhook (using targetPassengerId)
  };

  const handleUpgrade = useCallback((featureName: string, description?: string, title?: string) => {
    safeCloseDialog(() => {
      openPlanUpgradeDialog({
        feature: featureName,
        description,
        title,
      });
    });
  }, [openPlanUpgradeDialog]);
  
  // ... (rest of code)





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

  const handlePagarPix = useCallback((cobranca: Cobranca) => {
    openCobrancaPixDrawer({
      qrCodePayload: cobranca.qr_code_payload || "",
      valor: Number(cobranca.valor),
      passageiroNome: passageiro?.nome || "",
      mes: cobranca.mes,
      ano: cobranca.ano,
    });
  }, [openCobrancaPixDrawer, passageiro]);

  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    isFetching: isCobrancasFetching,
    refetch: refetchCobrancas,
  } = useCobrancasByPassageiro(passageiro_id, yearFilter, {
    enabled: !!passageiro_id,
    onError: () =>
      toast.error("cobranca.erro.buscarHistorico", {
        description: "Não foi possível concluir a operação.",
      }),
  });

  const cobrancas = (cobrancasData || []) as Cobranca[];

  const { data: availableYearsData, refetch: refetchAvailableYears } =
    useAvailableYears(passageiro_id, {
      enabled: !!passageiro_id,
      onError: () =>
        toast.error("cobranca.erro.buscarAnos", {
          description: "Não foi possível concluir a operação.",
        }),
    });

  const availableYears = (availableYearsData || [currentYear]) as string[];



  const loading =
    isSessionLoading ||
    isProfileLoading ||
    isPassageiroLoading ||
    isCobrancasLoading;

  // Validar se o passageiro existe após o carregamento
  // Se não existir (erro 404 ou dados null), redirecionar para a lista de passageiros
  // Isso previne acesso a rotas de recursos excluídos via navegação do browser
  useEffect(() => {
    if (!passageiro_id) return;
    
    // Verificar se terminou de carregar
    if (isPassageiroLoading) return;

    // Verificar se há erro (404 ou outro erro)
    const isNotFoundError = isPassageiroError && (
      (passageiroError as any)?.response?.status === 404 ||
      (passageiroError as any)?.status === 404
    );

    // Se há erro 404 ou dados null/undefined, o recurso não existe
    if (isNotFoundError || (!isPassageiroError && !passageiro)) {
      // Limpar cache do passageiro e queries relacionadas para evitar acesso futuro
      queryClient.removeQueries({ queryKey: ["passageiro", passageiro_id] });
      queryClient.removeQueries({ queryKey: ["cobrancas-by-passageiro", passageiro_id] });
      queryClient.removeQueries({ queryKey: ["available-years", passageiro_id] });
      
      // Redirecionar para lista de passageiros
      navigate("/passageiros", { replace: true });
    }
  }, [isPassageiroLoading, isPassageiroError, passageiroError, passageiro, passageiro_id, navigate, queryClient]);

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
    // setNovoVeiculoId(null);
    // setNovaEscolaId(null);
    refetchPassageiro();
  }, [refetchPassageiro]);

  const handleEditClick = useCallback(() => {
    openPassageiroFormDialog({
        mode: "edit",
        editingPassageiro: passageiro,
        onSuccess: handlePassageiroFormSuccess
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

  const handleCobrancaUpdated = () => {
    // Invalidação feita automaticamente pelos hooks de mutation
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
      }
    );
  };


  const handleCobrancaAdded = () => {
    // Invalidação feita automaticamente pelos hooks de mutation
  };

  const handleDeleteCobrancaClick = useCallback((cobranca: Cobranca) => {
    openConfirmationDialog({
      title: "Excluir cobrança?",
      description: "Tem certeza que deseja excluir esta cobrança? Essa ação não poderá ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
         try {
           await deleteCobranca.mutateAsync(cobranca.id);
           closeConfirmationDialog();
         } catch (error) {
           closeConfirmationDialog();
         }
      }
    });
  }, [deleteCobranca, closeConfirmationDialog]);



  const handleToggleClick = (statusAtual: boolean) => {
    const action = statusAtual ? "desativar" : "ativar";
    openConfirmationDialog({
       title: action === "ativar" ? "Reativar passageiro?" : "Desativar passageiro?",
       description: action === "ativar" 
         ? "O passageiro voltará a aparecer nas listagens ativas e a geração de cobranças será retomada."
         : "O passageiro ficará inativo e a geração de cobranças será pausada. Você poderá reativá-lo depois.",
       confirmText: action === "ativar" ? "Reativar" : "Desativar",
       variant: action === "desativar" ? "warning" : "default",
       onConfirm: async () => {
         if (!passageiro || !passageiro_id) return;
         try {
             await toggleAtivoPassageiro.mutateAsync({ id: passageiro_id, novoStatus: !passageiro.ativo });
             closeConfirmationDialog();
         } catch(error) {
             closeConfirmationDialog();
             // Rethrow para ser capturado pelo CarteirinhaInfo se for erro de limite
             throw error; 
         }
       }
    });
  };

  const handleReactivateWithoutAutomation = async () => {
    if (!passageiro || !passageiro_id) return;
    try {
        await updatePassageiro.mutateAsync({
            id: passageiro_id,
            data: { ativo: true, enviar_cobranca_automatica: false }
        });
        toast.success("passageiro.reativado_sem_automacao", {
             description: "Passageiro reativado com sucesso. A cobrança automática foi desligada para respeitar o limite do plano." 
        });
    } catch (error) {
        toast.error("Erro ao reativar passageiro.");
    }
  };

  const handleToggleLembretes = useCallback(
    async (cobranca: Cobranca) => {
      toggleNotificacoes.mutate({
        cobrancaId: cobranca.id,
        desativar: !cobranca.desativar_lembretes,
      });
    },
    [toggleNotificacoes]
  );

  const handleToggleCobrancaAutomatica = async () => {
    if (!passageiro || !passageiro_id || !profile?.id) return;

    const novoValor = !passageiro.enviar_cobranca_automatica;

    if (novoValor && canUseCobrancaAutomatica) { // Now boolean from hook
      // Usar validação já calculada via hook
      // Passamos false porque se estamos ativando, não está ativo, logo não descontamos.
      const podeAtivar = limits.franchise.checkAvailability(false);

        if (!podeAtivar) {
          if (validacaoFranquiaGeral.franquiaContratada === 0) {
             openPlanUpgradeDialog({
              feature: FEATURE_COBRANCA_AUTOMATICA,
              targetPassengerCount: limits.franchise.used + 1,
            });
          } else {
              openPlanUpgradeDialog({
                feature: FEATURE_COBRANCA_AUTOMATICA,
                targetPassengerCount: limits.franchise.used + 1,
              });
          }
          return;
        }
    }

    updatePassageiro.mutate({
      id: passageiro_id,
      data: { enviar_cobranca_automatica: novoValor },
    });
  };



  const handleEnviarNotificacaoClick = useCallback((cobrancaId: string) => {
    openConfirmationDialog({
      title: "Enviar cobrança?",
      description: "A cobrança será enviada para o responsável (WhatsApp ou Email). Confirmar?",
      confirmText: "Enviar",
      onConfirm: async () => {
         try {
           await enviarNotificacao.mutateAsync(cobrancaId);
           closeConfirmationDialog();
         } catch (error) {
            closeConfirmationDialog();
         }
      }
    });
  }, [enviarNotificacao, closeConfirmationDialog]);

  const handleDesfazerClick = useCallback((cobrancaId: string) => {
    openConfirmationDialog({
      title: "Desfazer pagamento?",
      description: "O pagamento será removido e a cobrança voltará a ficar pendente. Confirmar?",
      confirmText: "Desfazer",
      variant: "warning",
      onConfirm: async () => {
         try {
           await desfazerPagamento.mutateAsync(cobrancaId);
           closeConfirmationDialog();
         } catch(error) {
            closeConfirmationDialog();
         }
      }
    });
  }, [desfazerPagamento, closeConfirmationDialog]);

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
  const handlePaymentRecorded = () => {
    // Invalidação feita automaticamente pelos hooks de mutation
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
          // Cobrança não paga - verificar se está vencida
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
      }
    );
  }, [cobrancas]);

  // Verificar se há cobranças vencidas (não pagas)
  const temCobrancasVencidas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.some(
      (c) =>
        c.status !== CobrancaStatus.PAGO &&
        new Date(c.data_vencimento) < hoje
    );
  }, [cobrancas]);

  // Verificar se o recurso não existe e redirecionar antes de renderizar
  const isNotFoundError = isPassageiroError && (
    (passageiroError as any)?.response?.status === 404 ||
    (passageiroError as any)?.status === 404
  );
  
  if (!loading && (isNotFoundError || (!isPassageiroError && !passageiro && passageiro_id))) {
    // Não renderizar nada enquanto redireciona
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
            {/* Grid Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Esquerda: Informações e Observações (Sticky no Desktop) */}
              <div className="contents lg:block lg:col-span-4 lg:space-y-6 lg:sticky lg:top-6 lg:h-fit">
                <div className="order-1 lg:order-none">
                  <Suspense
                    fallback={<Skeleton className="h-96 w-full rounded-2xl" />}
                  >
                    <CarteirinhaInfo
                      passageiro={passageiro}
                      plano={plano}
                      temCobrancasVencidas={temCobrancasVencidas}
                      isCopiedEndereco={isCopiedEndereco}
                      isCopiedTelefone={isCopiedTelefone}
                      onEditClick={handleEditClick}
                      onCopyToClipboard={handleCopyToClipboard}
                      onToggleCobrancaAutomatica={
                        handleToggleCobrancaAutomatica
                      }
                      onToggleClick={handleToggleClick}
                      onDeleteClick={() =>
                        openConfirmationDialog({
                           title: "Excluir passageiro?",
                           description: "Tem certeza que deseja excluir este passageiro? Essa ação não poderá ser desfeita.",
                           confirmText: "Excluir",
                           variant: "destructive",
                           onConfirm: async () => {
                             if (!passageiro_id) return;
                             try {
                               await deletePassageiro.mutateAsync(passageiro_id);
                               closeConfirmationDialog();
                               navigate("/passageiros");
                             } catch (error) {
                               closeConfirmationDialog();
                             }
                           }
                        })
                      }
                      onUpgrade={handleUpgrade}
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

              {/* Coluna Direita: Financeiro e Cobranças */}
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
                      plano={plano}
                      yearFilter={yearFilter}
                      availableYears={availableYears}
                      mostrarTodasCobrancas={mostrarTodasCobrancas}
                      limiteCobrancasMobile={COBRANCAS_LIMIT}
                      onYearChange={setYearFilter}
                      onOpenCobrancaDialog={() => setCobrancaDialogOpen(true)}
                      onNavigateToCobranca={(id) =>
                        navigate(`/cobrancas/${id}`)
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
                      onPagarPix={handlePagarPix}
                      onEnviarNotificacao={handleEnviarNotificacaoClick}
                      onToggleLembretes={handleToggleLembretes}
                      onDesfazerPagamento={handleDesfazerClick}
                      onToggleClick={handleToggleClick}
                      onUpgrade={handleUpgrade}
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
        passageiroId={passageiro_id || ""}
        passageiroNome={passageiro?.nome || ""}
        passageiroResponsavelNome={passageiro?.nome_responsavel || ""}
        valorCobranca={Number(passageiro?.valor_cobranca || 0)}
        diaVencimento={Number(passageiro?.dia_vencimento || 10)}
        onCobrancaAdded={refetchCobrancas}
      />
    </>
  );
}
