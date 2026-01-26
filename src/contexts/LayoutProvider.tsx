import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import FirstChargeDialog from "@/components/dialogs/FirstChargeDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import PixKeyDialog from "@/components/dialogs/PixKeyDialog";
import {
    PlanUpgradeDialog,
} from "@/components/dialogs/PlanUpgradeDialog";
import { SubscriptionExpiredDialog } from "@/components/dialogs/SubscriptionExpiredDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import { CobrancaPixDrawer } from "@/components/features/cobranca/CobrancaPixDrawer";
import {
    FEATURE_COBRANCA_AUTOMATICA,
    FEATURE_GASTOS,
    FEATURE_LIMITE_PASSAGEIROS,
    FEATURE_NOTIFICACOES,
    FEATURE_RELATORIOS,
    PLANO_PROFISSIONAL,
} from "@/constants";
import { safeCloseDialog } from "@/hooks";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { usePixKeyGuard } from "@/hooks/ui/usePixKeyGuard";
import { PassageiroFormModes, PixKeyStatus } from "@/types/enums";
import {
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    LayoutContext,
    OpenCobrancaEditDialogProps,
    OpenCobrancaPixDrawerProps,
    OpenConfirmationDialogProps,
    OpenEscolaFormProps,
    OpenFirstChargeDialogProps,
    OpenGastoFormProps,
    OpenManualPaymentDialogProps,
    OpenPassageiroFormProps,
    OpenPlanUpgradeDialogProps,
    OpenSubscriptionExpiredDialogProps,
    OpenVeiculoFormProps
} from "./LayoutContext";

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState("Carregando...");
  const [pageSubtitle, setPageSubtitle] = useState("Por favor, aguarde.");

  // Sync document title with page title
  useEffect(() => {
    if (pageTitle && pageTitle !== "Carregando...") {
      document.title = `${pageTitle} | Van360`;
    }
  }, [pageTitle]);

  // Novo Plan Upgrade Dialog State (Unificado)
  const [planUpgradeDialogState, setPlanUpgradeDialogState] = useState<{
    open: boolean;
    props?: OpenPlanUpgradeDialogProps;
  }>({
    open: false,
  });

  const [subscriptionExpiredDialogState, setSubscriptionExpiredDialogState] = useState<{
    open: boolean;
    props?: OpenSubscriptionExpiredDialogProps;
  }>({ open: false });

  // Confirmation Dialog State
  const [confirmationDialogState, setConfirmationDialogState] = useState<{
    open: boolean;
    props?: OpenConfirmationDialogProps;
  }>({
    open: false,
  });

  // Escola Form Dialog State
  const [escolaFormDialogState, setEscolaFormDialogState] = useState<{
    open: boolean;
    props?: OpenEscolaFormProps;
  }>({
    open: false,
  });

  // Veiculo Form Dialog State
  const [veiculoFormDialogState, setVeiculoFormDialogState] = useState<{
    open: boolean;
    props?: OpenVeiculoFormProps;
  }>({
    open: false,
  });

  // Passageiro Form Dialog State
  const [passageiroFormDialogState, setPassageiroFormDialogState] = useState<{
    open: boolean;
    props?: OpenPassageiroFormProps;
  }>({
    open: false,
  });

  // Gasto Form Dialog State
  const [gastoFormDialogState, setGastoFormDialogState] = useState<{
    open: boolean;
    props?: OpenGastoFormProps;
  }>({
    open: false,
  });

  const { user } = useSession();
  const {
    profile,
    is_profissional,
    isLoading: isProfileLoading,
    plano,
  } = useProfile(user?.id);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { limits } = usePlanLimits();

  // Dialog States (Global)
  const [pixKeyDialogState, setPixKeyDialogState] = useState<{
    open: boolean;
    onSuccess?: () => void;
    canClose?: boolean;
  }>({
    open: false,
    canClose: true,
  });



  const [cobrancaEditDialogState, setCobrancaEditDialogState] = useState<{
    open: boolean;
    props?: OpenCobrancaEditDialogProps;
  }>({
    open: false,
  });

  const [cobrancaPixDrawerState, setCobrancaPixDrawerState] = useState<{
    open: boolean;
    props?: OpenCobrancaPixDrawerProps;
  }>({
    open: false,
  });

  const [manualPaymentDialogState, setManualPaymentDialogState] = useState<{
    open: boolean;
    props?: OpenManualPaymentDialogProps;
  }>({
    open: false,
  });

  const [firstChargeDialogState, setFirstChargeDialogState] = useState<{
    open: boolean;
    props?: OpenFirstChargeDialogProps;
  }>({
    open: false,
  });

  // Prioridade de Dialogs: PIX Key > Whatsapp
  const isPixKeyValid = !!profile?.chave_pix && profile?.status_chave_pix === PixKeyStatus.VALIDADA;

  const handleOpenPixKeyDialog = useCallback(() => {
    setPixKeyDialogState({
      open: true,
      canClose: false,
    });
  }, []);

  usePixKeyGuard({
    profile,
    isProfissional: !!is_profissional,
    isLoading: isProfileLoading,
    onShouldOpen: handleOpenPixKeyDialog,
  });



  // Global Check for Whatsapp (Professional Plan)
  // Global WhatsApp Check Removed - Global Instance Active


  const openPlanUpgradeDialog = (props?: OpenPlanUpgradeDialogProps) => {
    let defaultTab = props?.defaultTab;

    // Inferência inteligente de aba baseada na feature/dor
    if (!defaultTab && props?.feature) {
      switch (props.feature) {
        case FEATURE_COBRANCA_AUTOMATICA:
        case FEATURE_RELATORIOS:
        case FEATURE_NOTIFICACOES:
          defaultTab = PLANO_PROFISSIONAL;
          break;
        case FEATURE_LIMITE_PASSAGEIROS:
        case FEATURE_GASTOS:
          defaultTab = "essencial";
          break;
      }
    }

    setPlanUpgradeDialogState({
      open: true,
      props: {
        ...props,
        defaultTab,
      },
    });
  };



  const openSubscriptionExpiredDialog = (props?: OpenSubscriptionExpiredDialogProps) => {
    setSubscriptionExpiredDialogState({ open: true, props });
  };

  const openPixKeyDialog = (options?: {
    onSuccess?: () => void;
    canClose?: boolean;
  }) => {
    setPixKeyDialogState({
      open: true,
      onSuccess: options?.onSuccess,
      canClose: options?.canClose ?? true,
    });
  };

  const closePixKeyDialog = () => {
    setPixKeyDialogState((prev) => ({ ...prev, open: false }));
  };

  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => {
    setConfirmationDialogState({
      open: true,
      props,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialogState((prev) => ({ ...prev, open: false }));
  };

  const openEscolaFormDialog = (props?: OpenEscolaFormProps) => {
    setEscolaFormDialogState({
      open: true,
      props,
    });
  };

  const openVeiculoFormDialog = (props?: OpenVeiculoFormProps) => {
    setVeiculoFormDialogState({
      open: true,
      props,
    });
  };

  const openPassageiroFormDialog = (props?: OpenPassageiroFormProps) => {
    setPassageiroFormDialogState({
      open: true,
      props,
    });
  };

  const openGastoFormDialog = (props?: OpenGastoFormProps) => {
    setGastoFormDialogState({
      open: true,
      props,
    });
  };



  const openCobrancaEditDialog = (props: OpenCobrancaEditDialogProps) => {
    setCobrancaEditDialogState({
      open: true,
      props,
    });
  };

  const openCobrancaPixDrawer = (props: OpenCobrancaPixDrawerProps) => {
    setCobrancaPixDrawerState({
      open: true,
      props,
    });
  };

  const openManualPaymentDialog = (props: OpenManualPaymentDialogProps) => {
    setManualPaymentDialogState({
      open: true,
      props,
    });
  };

  const openFirstChargeDialog = (props: OpenFirstChargeDialogProps) => {
    setFirstChargeDialogState({
      open: true,
      props,
    });
  };

  return (
    <LayoutContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        pageSubtitle,
        setPageSubtitle,
        openPlanUpgradeDialog,
        isPlanUpgradeDialogOpen: planUpgradeDialogState.open,
        openSubscriptionExpiredDialog,
        isSubscriptionExpiredDialogOpen: subscriptionExpiredDialogState.open,
        openConfirmationDialog,
        closeConfirmationDialog,
        openEscolaFormDialog,
        openVeiculoFormDialog,
        openPassageiroFormDialog,
        openGastoFormDialog,
        openPixKeyDialog,
        closePixKeyDialog,
        isPixKeyDialogOpen: pixKeyDialogState.open,

        openCobrancaEditDialog,
        openCobrancaPixDrawer,
        openManualPaymentDialog,
        openFirstChargeDialog,
        isFirstChargeDialogOpen: firstChargeDialogState.open,
      }}
    >
      {children}

      {planUpgradeDialogState.open && (
        <PlanUpgradeDialog
          open={planUpgradeDialogState.open}
          onOpenChange={(open) => {
            if (!open) {
                safeCloseDialog(() => {
                    setPlanUpgradeDialogState((prev) => ({ ...prev, open: false }));
                    planUpgradeDialogState.props?.onClose?.();
                });
            } else {
                setPlanUpgradeDialogState((prev) => ({ ...prev, open }));
            }
          }}
          defaultTab={planUpgradeDialogState.props?.defaultTab}
          feature={planUpgradeDialogState.props?.feature}
          targetPassengerCount={
            planUpgradeDialogState.props?.targetPassengerCount
          }
          onSuccess={planUpgradeDialogState.props?.onSuccess}
          title={planUpgradeDialogState.props?.title}
          description={planUpgradeDialogState.props?.description}
        />
      )}



      {subscriptionExpiredDialogState.open && (
        <SubscriptionExpiredDialog
            open={subscriptionExpiredDialogState.open}
            onOpenChange={(open) => {
                 if (!open) {
                    safeCloseDialog(() => {
                        setSubscriptionExpiredDialogState((prev) => ({ ...prev, open: false }));
                        subscriptionExpiredDialogState.props?.onSuccess?.();
                    });
                 } else {
                    setSubscriptionExpiredDialogState((prev) => ({ ...prev, open }));
                 }
            }}
        />
      )}

      {confirmationDialogState.open && confirmationDialogState.props && (
        <ConfirmationDialog
          open={confirmationDialogState.open}
          onOpenChange={(open) => {
            if (!open) {
              safeCloseDialog(() => {
                setConfirmationDialogState((prev) => ({ ...prev, open }));
              });
            } else {
              setConfirmationDialogState((prev) => ({ ...prev, open }));
            }
          }}
          title={confirmationDialogState.props.title}
          description={confirmationDialogState.props.description}
          onConfirm={() =>
            safeCloseDialog(() => {
              confirmationDialogState.props.onConfirm();
            })
          }
          confirmText={confirmationDialogState.props.confirmText}
          cancelText={confirmationDialogState.props.cancelText}
          variant={confirmationDialogState.props.variant}
          isLoading={confirmationDialogState.props.isLoading}
          onCancel={confirmationDialogState.props.onCancel}
        />
      )}

      {escolaFormDialogState.open && (
        <EscolaFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() => 
                setEscolaFormDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          onSuccess={(escola, keepOpen) => {
            if (!keepOpen) {
              setEscolaFormDialogState((prev) => ({ ...prev, open: false }));
            }
            escolaFormDialogState.props?.onSuccess?.(escola, keepOpen);
          }}
          editingEscola={escolaFormDialogState.props?.editingEscola}
          profile={profile}
          allowBatchCreation={escolaFormDialogState.props?.allowBatchCreation}
        />
      )}

      {veiculoFormDialogState.open && (
        <VeiculoFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() => 
                setVeiculoFormDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          onSuccess={(veiculo, keepOpen) => {
            if (!keepOpen) {
              setVeiculoFormDialogState((prev) => ({ ...prev, open: false }));
            }
            veiculoFormDialogState.props?.onSuccess?.(veiculo, keepOpen);
          }}
          editingVeiculo={veiculoFormDialogState.props?.editingVeiculo}
          profile={profile}
          allowBatchCreation={veiculoFormDialogState.props?.allowBatchCreation}
        />
      )}

      {passageiroFormDialogState.open && (
        <PassageiroFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() => 
                setPassageiroFormDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          onSuccess={(data) => {
            setPassageiroFormDialogState((prev) => ({ ...prev, open: false }));
            passageiroFormDialogState.props?.onSuccess?.(data);
          }}
          editingPassageiro={
            passageiroFormDialogState.props?.editingPassageiro || null
          }
          mode={passageiroFormDialogState.props?.mode || PassageiroFormModes.CREATE}
          prePassageiro={passageiroFormDialogState.props?.prePassageiro}
          profile={profile}
          plano={plano as any}
        />
      )}

      {gastoFormDialogState.open && (
        <GastoFormDialog
          isOpen={true}
           onOpenChange={(open) => {
            if (!open) {
                safeCloseDialog(() => {
                    setGastoFormDialogState((prev) => ({ ...prev, open: false }));
                });
            } else {
                setGastoFormDialogState((prev) => ({ ...prev, open }));
            }
          }}
          onSuccess={() => {
            setGastoFormDialogState((prev) => ({ ...prev, open: false }));
            gastoFormDialogState.props?.onSuccess?.();
          }}
          gastoToEdit={gastoFormDialogState.props?.gastoToEdit}
          veiculos={gastoFormDialogState.props?.veiculos || []}
          usuarioId={gastoFormDialogState.props?.usuarioId || profile?.id}
        />
      )}

      {pixKeyDialogState.open && (
        <PixKeyDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() => 
                setPixKeyDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          canClose={pixKeyDialogState.canClose}
          onSuccess={() => {
            pixKeyDialogState.onSuccess?.();
          }}
        />
      )}



      {cobrancaEditDialogState.open && cobrancaEditDialogState.props && (
        <CobrancaEditDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() => 
                setCobrancaEditDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          cobranca={cobrancaEditDialogState.props.cobranca}
          onCobrancaUpdated={() => {
            cobrancaEditDialogState.props?.onSuccess?.();
            setCobrancaEditDialogState((prev) => ({ ...prev, open: false }));
          }}
        />
      )}

      {cobrancaPixDrawerState.open && cobrancaPixDrawerState.props && (
        <CobrancaPixDrawer
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              safeCloseDialog(() => 
                  setCobrancaPixDrawerState((prev) => ({ ...prev, open: false }))
              )
            } else {
              setCobrancaPixDrawerState((prev) => ({ ...prev, open }));
            }
          }}
          qrCodePayload={cobrancaPixDrawerState.props.qrCodePayload}
          valor={cobrancaPixDrawerState.props.valor}
          passageiroNome={cobrancaPixDrawerState.props.passageiroNome}
          mes={cobrancaPixDrawerState.props.mes}
          ano={cobrancaPixDrawerState.props.ano}
        />
      )}

      {manualPaymentDialogState.open && manualPaymentDialogState.props && (
        <ManualPaymentDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setManualPaymentDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          cobrancaId={manualPaymentDialogState.props.cobrancaId}
          passageiroNome={manualPaymentDialogState.props.passageiroNome}
          responsavelNome={manualPaymentDialogState.props.responsavelNome}
          valorOriginal={manualPaymentDialogState.props.valorOriginal}
          status={manualPaymentDialogState.props.status}
          dataVencimento={manualPaymentDialogState.props.dataVencimento}
          onPaymentRecorded={() => {
            manualPaymentDialogState.props?.onPaymentRecorded();
            // Optional: close dialog on success is handled by the component or we can close here if needed
            // But usually the component props onClose handles it or the component calls onClose
          }}
        />
      )}

      {firstChargeDialogState.open && firstChargeDialogState.props && (
        <FirstChargeDialog
            isOpen={true}
            onClose={() => {
                setFirstChargeDialogState(prev => ({ ...prev, open: false }));
                firstChargeDialogState.props?.onSuccess?.();
            }}
            passageiro={firstChargeDialogState.props.passageiro}
        />
      )}
    </LayoutContext.Provider>
  );
};
