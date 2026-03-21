import CobrancaDeleteDialog from "@/components/dialogs/CobrancaDeleteDialog";
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import ContractSetupDialog from "@/components/dialogs/ContractSetupDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import FirstChargeDialog from "@/components/dialogs/FirstChargeDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useContractGuard } from "@/hooks/ui/useContractGuard";

import { PassageiroFormModes } from "@/types/enums";
import { ReactNode, useEffect, useState } from "react";
import {
  LayoutContext,
  OpenCobrancaDeleteDialogProps,
  OpenCobrancaEditDialogProps,
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

  const [firstChargeDialogState, setFirstChargeDialogState] = useState<{
    open: boolean;
    props?: OpenFirstChargeDialogProps;
  }>({
    open: false,
  });

  const [contractSetupDialogState, setContractSetupDialogState] = useState<{
    open: boolean;
    props?: OpenContractSetupDialogProps;
  }>({
    open: false,
  });

  useContractGuard({
    profile,
    isLoading: isProfileLoading,
    onShouldOpen: () => setContractSetupDialogState({ open: true }),
    disabled: false
  });

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
        openConfirmationDialog,
        closeConfirmationDialog,
        openEscolaFormDialog,
        openVeiculoFormDialog,
        openPassageiroFormDialog,
        openGastoFormDialog,
        openCobrancaDeleteDialog,
        closeCobrancaDeleteDialog,
        openCobrancaEditDialog,
        openManualPaymentDialog,
        openFirstChargeDialog,
        isFirstChargeDialogOpen: firstChargeDialogState.open,
        openContractSetupDialog: (props?: OpenContractSetupDialogProps) =>
          setContractSetupDialogState({ open: true, props }),
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
          onConfirm={() =>
            safeCloseDialog(() => {
              confirmationDialogState.props!.onConfirm();
            })
          }
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
          onClose={() =>
            safeCloseDialog(() =>
              setPassageiroFormDialogState((prev) => ({
                ...prev,
                open: false,
              })),
            )
          }
          onSuccess={(data) => {
            setPassageiroFormDialogState((prev) => ({ ...prev, open: false }));
            passageiroFormDialogState.props?.onSuccess?.(data);
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
          onPaymentRecorded={() => {
            manualPaymentDialogState.props?.onPaymentRecorded();
          }}
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

      <ContractSetupDialog
        isOpen={contractSetupDialogState.open}
        onClose={() => setContractSetupDialogState({ open: false })}
        onSuccess={contractSetupDialogState.props?.onSuccess}
      />
    </LayoutContext.Provider>
  );
};
