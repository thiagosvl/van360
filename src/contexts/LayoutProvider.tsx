import AlterarSenhaDialog from "@/components/dialogs/AlterarSenhaDialog";
import HistoricoDialog from "@/components/dialogs/HistoricoDialog";
import CobrancaDeleteDialog from "@/components/dialogs/CobrancaDeleteDialog";
import CobrancaDialog from "@/components/dialogs/CobrancaDialog";
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import AdminCreateUserDialog from "@/components/dialogs/AdminCreateUserDialog";
import ContractSetupDialog from "@/components/dialogs/ContractSetupDialog";
import EditarCadastroDialog from "@/components/dialogs/EditarCadastroDialog";
import EditarPixDialog from "@/components/dialogs/EditarPixDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import FirstChargeDialog from "@/components/dialogs/FirstChargeDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";

import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";

import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import PixPaymentDialog from "@/components/dialogs/PixPaymentDialog";
import { SaaSCheckoutDialog } from "@/components/dialogs/SaaSCheckoutDialog";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { QuickStartPassageiroDialog } from "@/components/dialogs/QuickStartPassageiroDialog";
import { OpenPixPaymentDialogProps, OpenSaaSCheckoutDialogProps, OpenReceiptDialogProps, OpenQuickStartPassageiroProps } from "./LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Capacitor } from "@capacitor/core";
import { openBrowserLink } from "@/utils/browser";
import { BASE_DOMAIN } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { supabase } from "@/integrations/supabase/client";
import { PassageiroFormModes } from "@/types/enums";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  LayoutContext,
  OpenCobrancaDeleteDialogProps,
  OpenCobrancaEditDialogProps,
  OpenCobrancaFormProps,
  OpenCobrancaHistoryProps,
  OpenConfirmationDialogProps,
  OpenContractSetupDialogProps,
  OpenEscolaFormProps,
  OpenFirstChargeDialogProps,
  OpenGastoFormProps,
  OpenManualPaymentDialogProps,
  OpenPassageiroFormProps,
  OpenVeiculoFormProps,
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

  const [quickStartPassageiroState, setQuickStartPassageiroState] = useState<{
    open: boolean;
    props?: OpenQuickStartPassageiroProps;
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
    isLoading: isProfileLoading,
    profile
  } = useProfile(user?.id);

  const [cobrancaEditDialogState, setCobrancaEditDialogState] = useState<{
    open: boolean;
    props?: OpenCobrancaEditDialogProps;
  }>({
    open: false,
  });

  const [cobrancaDeleteDialogState, setCobrancaDeleteDialogState] = useState<{
    open: boolean;
    props?: OpenCobrancaDeleteDialogProps;
  }>({
    open: false,
  });

  const [manualPaymentDialogState, setManualPaymentDialogState] = useState<{
    open: boolean;
    props?: OpenManualPaymentDialogProps;
  }>({
    open: false,
  });

  const [receiptDialogState, setReceiptDialogState] = useState<{
    open: boolean;
    props?: OpenReceiptDialogProps;
  }>({
    open: false,
  });

  const [cobrancaFormDialogState, setCobrancaFormDialogState] = useState<{
    open: boolean;
    props?: OpenCobrancaFormProps;
  }>({
    open: false,
  });

  const [firstChargeDialogState, setFirstChargeDialogState] = useState<{
    open: boolean;
    props?: OpenFirstChargeDialogProps;
  }>({
    open: false,
  });

  const [cobrancaHistoryDialogState, setCobrancaHistoryDialogState] = useState<{
    open: boolean;
    props?: OpenCobrancaHistoryProps;
  }>({
    open: false,
  });

  const [contractSetupDialogState, setContractSetupDialogState] = useState<{
    open: boolean;
    props?: OpenContractSetupDialogProps;
  }>({
    open: false,
  });

  const [pixPaymentDialogState, setPixPaymentDialogState] = useState<{
    open: boolean;
    props?: OpenPixPaymentDialogProps;
  }>({
    open: false,
  });

  const [saasCheckoutDialogState, setSaasCheckoutDialogState] = useState<{
    open: boolean;
    props?: OpenSaaSCheckoutDialogProps;
  }>({
    open: false,
  });

  const [alterarSenhaDialogOpen, setAlterarSenhaDialogOpen] = useState(false);
  const [editarCadastroDialogOpen, setEditarCadastroDialogOpen] = useState(false);
  const [editarPixDialogOpen, setEditarPixDialogOpen] = useState(false);
  const [adminCreateUserDialogState, setAdminCreateUserDialogState] = useState<{
    open: boolean;
    onSuccess?: (userId: string) => void;
  }>({ open: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGlobalLoading, setIsGlobalLoadingState] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState<string | undefined>();

  const usarContratos = profile?.config_contrato?.usar_contratos;

  const handleContractGuardOpen = useCallback(() => {
    setContractSetupDialogState({ open: true });
  }, []);

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

  const openQuickStartPassageiroDialog = (props?: OpenQuickStartPassageiroProps) => {
    setQuickStartPassageiroState({
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

  const openCobrancaDeleteDialog = (props: OpenCobrancaDeleteDialogProps) => {
    setCobrancaDeleteDialogState({
      open: true,
      props,
    });
  };

  const closeCobrancaDeleteDialog = () => {
    setCobrancaDeleteDialogState((prev) => ({ ...prev, open: false }));
  };

  const openCobrancaEditDialog = (props: OpenCobrancaEditDialogProps) => {
    setCobrancaEditDialogState({
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

  const openReceiptDialog = (props: OpenReceiptDialogProps) => {
    setReceiptDialogState({
      open: true,
      props,
    });
  };

  const openCobrancaFormDialog = (props: OpenCobrancaFormProps) => {
    setCobrancaFormDialogState({
      open: true,
      props,
    });
  };

  const openFirstChargeDialog = (props: OpenFirstChargeDialogProps) => setFirstChargeDialogState({ open: true, props });

  const openCobrancaHistoryDialog = (props: OpenCobrancaHistoryProps) => setCobrancaHistoryDialogState({ open: true, props });
  const closeCobrancaHistoryDialog = () => safeCloseDialog(() => setCobrancaHistoryDialogState(prev => ({ ...prev, open: false })));

  const openContractSetupDialog = (props?: OpenContractSetupDialogProps) => {
    setContractSetupDialogState({ open: true, props });
  };

  const openPixPaymentDialog = (props: OpenPixPaymentDialogProps) => {
    setPixPaymentDialogState({ open: true, props });
  };

  const openSaaSCheckoutDialog = async (props: OpenSaaSCheckoutDialogProps) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const { access_token, refresh_token } = data.session;
          const checkoutUrl = `${BASE_DOMAIN}${ROUTES.PUBLIC.EXTERNAL_CHECKOUT_BRIDGE}?access_token=${access_token}&refresh_token=${refresh_token}&auto_open=true`;
          openBrowserLink(checkoutUrl);
          return;
        }
      } catch (err) {
        console.error("Erro ao gerar link de checkout externo:", err);
      }
    }
    setSaasCheckoutDialogState({ open: true, props });
  };

  const openAdminCreateUserDialog = (onSuccess?: (userId: string) => void) => {
    setAdminCreateUserDialogState({ open: true, onSuccess });
  };

  return (
    <LayoutContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        pageSubtitle,
        setPageSubtitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openEscolaFormDialog,
        openVeiculoFormDialog,
        openPassageiroFormDialog,
        openQuickStartPassageiroDialog,
        openGastoFormDialog,
        openCobrancaDeleteDialog,
        closeCobrancaDeleteDialog,
        openCobrancaEditDialog,
        openManualPaymentDialog,
        openReceiptDialog,
        openCobrancaFormDialog,
        openFirstChargeDialog,
        openCobrancaHistoryDialog,
        openPixPaymentDialog,
        openSaaSCheckoutDialog,
        openAdminCreateUserDialog,

        isFirstChargeDialogOpen: firstChargeDialogState.open,
        openContractSetupDialog,
        openAlterarSenhaDialog: () => setAlterarSenhaDialogOpen(true),
        openEditarCadastroDialog: () => setEditarCadastroDialogOpen(true),
        openEditarPixDialog: () => setEditarPixDialogOpen(true),
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isHelpOpen,
        setIsHelpOpen,
        isGlobalLoading,
        setIsGlobalLoading: (active: boolean, text?: string) => {
          setIsGlobalLoadingState(active);
          setGlobalLoadingText(text);
        },
      }}
    >
      {children}

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
          onConfirm={() => {
            if (confirmationDialogState.props?.onConfirm) {
              return confirmationDialogState.props.onConfirm();
            }
          }}
          confirmText={confirmationDialogState.props.confirmText}
          cancelText={confirmationDialogState.props.cancelText}
          variant={confirmationDialogState.props.variant}
          isLoading={confirmationDialogState.props.isLoading}
          onCancel={confirmationDialogState.props.onCancel}
          allowClose={confirmationDialogState.props.allowClose}
        />
      )}

      {escolaFormDialogState.open && (
        <EscolaFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setEscolaFormDialogState((prev) => ({ ...prev, open: false })),
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
              setVeiculoFormDialogState((prev) => ({ ...prev, open: false })),
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
          onSuccess={(data, metadata) => {
            const innerOnSuccess = passageiroFormDialogState.props?.onSuccess;
            if (innerOnSuccess) {
              innerOnSuccess(data, metadata);
            }
            // Depois fecha o diálogo
            setPassageiroFormDialogState((prev) => ({ ...prev, open: false }));
          }}
          onClose={() => {
            setPassageiroFormDialogState((prev) => ({ ...prev, open: false }));
          }}
          editingPassageiro={
            passageiroFormDialogState.props?.editingPassageiro || null
          }
          mode={
            passageiroFormDialogState.props?.mode || PassageiroFormModes.CREATE
          }
          prePassageiro={passageiroFormDialogState.props?.prePassageiro}
          profile={profile}
        />
      )}

      {quickStartPassageiroState.open && (
        <QuickStartPassageiroDialog
          isOpen={true}
          onClose={() => setQuickStartPassageiroState({ open: false })}
          onSuccess={quickStartPassageiroState.props?.onSuccess}
          usuarioId={profile?.id}
        />
      )}

      {gastoFormDialogState.open && (
        <GastoFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setGastoFormDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          onSuccess={() => {
            setGastoFormDialogState((prev) => ({ ...prev, open: false }));
            gastoFormDialogState.props?.onSuccess?.();
          }}
          gastoToEdit={gastoFormDialogState.props?.gastoToEdit}
          veiculos={gastoFormDialogState.props?.veiculos || []}
          usuarioId={gastoFormDialogState.props?.usuarioId || profile?.id}
        />
      )}

      {cobrancaEditDialogState.open && cobrancaEditDialogState.props && (
        <CobrancaEditDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setCobrancaEditDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          cobranca={cobrancaEditDialogState.props.cobranca}
          onCobrancaUpdated={() => {
            cobrancaEditDialogState.props?.onSuccess?.();
            setCobrancaEditDialogState((prev) => ({ ...prev, open: false }));
          }}
        />
      )}

      {cobrancaDeleteDialogState.open && cobrancaDeleteDialogState.props && (
        <CobrancaDeleteDialog
          open={cobrancaDeleteDialogState.open}
          onOpenChange={(open) => {
            if (!open) {
              safeCloseDialog(() =>
                setCobrancaDeleteDialogState((prev) => ({
                  ...prev,
                  open: false,
                })),
              );
            } else {
              setCobrancaDeleteDialogState((prev) => ({ ...prev, open }));
            }
          }}
          onConfirm={async () => {
            const result = cobrancaDeleteDialogState.props?.onConfirm();
            if (result instanceof Promise) {
              try {
                await result;
              } finally {
                closeCobrancaDeleteDialog();
              }
            } else {
              closeCobrancaDeleteDialog();
            }
          }}
          onEdit={() => {
            cobrancaDeleteDialogState.props?.onEdit();
            closeCobrancaDeleteDialog();
          }}
          isLoading={cobrancaDeleteDialogState.props?.isLoading}
        />
      )}

      {manualPaymentDialogState.open && manualPaymentDialogState.props && (
        <ManualPaymentDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setManualPaymentDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          cobrancaId={manualPaymentDialogState.props.cobrancaId}
          passageiroNome={manualPaymentDialogState.props.passageiroNome}
          responsavelNome={manualPaymentDialogState.props.responsavelNome}
          valorOriginal={manualPaymentDialogState.props.valorOriginal}
          status={manualPaymentDialogState.props.status}
          dataVencimento={manualPaymentDialogState.props.dataVencimento}
          onPaymentRecorded={(updatedCobranca) => {
            manualPaymentDialogState.props?.onPaymentRecorded?.(updatedCobranca);
          }}
        />
      )}

      {cobrancaFormDialogState.open && cobrancaFormDialogState.props && (
        <CobrancaDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setCobrancaFormDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          onCobrancaAdded={() => {
            cobrancaFormDialogState.props?.onSuccess?.();
            setCobrancaFormDialogState((prev) => ({ ...prev, open: false }));
          }}
          passageiroId={cobrancaFormDialogState.props.passageiroId}
          passageiroNome={cobrancaFormDialogState.props.passageiroNome}
          passageiroResponsavelNome={
            cobrancaFormDialogState.props.passageiroResponsavelNome
          }
          valorCobranca={cobrancaFormDialogState.props.valorCobranca}
          diaVencimento={cobrancaFormDialogState.props.diaVencimento}
        />
      )}

      {cobrancaHistoryDialogState.open && cobrancaHistoryDialogState.props && (
        <HistoricoDialog
          isOpen={true}
          onClose={closeCobrancaHistoryDialog}
          cobrancaId={cobrancaHistoryDialogState.props.cobrancaId}
        />
      )}

      {firstChargeDialogState.open && firstChargeDialogState.props && (
        <FirstChargeDialog
          isOpen={true}
          onClose={() => {
            setFirstChargeDialogState((prev) => ({ ...prev, open: false }));
            firstChargeDialogState.props?.onSuccess?.();
          }}
          passageiro={firstChargeDialogState.props.passageiro}
        />
      )}

      {contractSetupDialogState.open && (
        <ContractSetupDialog
          isOpen={true}
          onClose={() => setContractSetupDialogState({ open: false })}
          onSuccess={contractSetupDialogState.props?.onSuccess}
          skipWelcome={contractSetupDialogState.props?.skipWelcome}
        />
      )}

      {alterarSenhaDialogOpen && (
        <AlterarSenhaDialog
          isOpen={alterarSenhaDialogOpen}
          onClose={() => safeCloseDialog(() => setAlterarSenhaDialogOpen(false))}
        />
      )}

      {editarCadastroDialogOpen && (
        <EditarCadastroDialog
          isOpen={editarCadastroDialogOpen}
          onClose={() => safeCloseDialog(() => setEditarCadastroDialogOpen(false))}
        />
      )}

      {editarPixDialogOpen && (
        <EditarPixDialog
          isOpen={editarPixDialogOpen}
          onClose={() => safeCloseDialog(() => setEditarPixDialogOpen(false))}
        />
      )}

      {pixPaymentDialogState.open && pixPaymentDialogState.props && (
        <PixPaymentDialog
          isOpen={true}
          onClose={() => setPixPaymentDialogState({ open: false })}
          {...pixPaymentDialogState.props}
        />
      )}

      {saasCheckoutDialogState.open && saasCheckoutDialogState.props && (
        <SaaSCheckoutDialog
          isOpen={true}
          onClose={() => setSaasCheckoutDialogState({ open: false })}
          plans={saasCheckoutDialogState.props.plans}
          initialPlanId={saasCheckoutDialogState.props.initialPlanId}
          onSuccess={saasCheckoutDialogState.props.onSuccess}
          forcedPeriod={saasCheckoutDialogState.props.forcedPeriod}
        />
      )}

      {receiptDialogState.open && receiptDialogState.props && (
        <ReceiptDialog
          isOpen={true}
          onClose={() => setReceiptDialogState({ open: false })}
          receiptUrl={receiptDialogState.props.receiptUrl}
          cobrancaDescricao={receiptDialogState.props.cobrancaDescricao}
        />
      )}

      {adminCreateUserDialogState.open && (
        <AdminCreateUserDialog
          isOpen={true}
          onClose={() => setAdminCreateUserDialogState({ open: false })}
          onSuccess={adminCreateUserDialogState.onSuccess}
        />
      )}

    </LayoutContext.Provider>
  );
};
