import AlterarSenhaDialog from "@/components/dialogs/AlterarSenhaDialog";
import CobrancaDeleteDialog from "@/components/dialogs/CobrancaDeleteDialog";
import CobrancaDialog from "@/components/dialogs/CobrancaDialog";
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import ContractSetupDialog from "@/components/dialogs/ContractSetupDialog";
import EditarCadastroDialog from "@/components/dialogs/EditarCadastroDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import FirstChargeDialog from "@/components/dialogs/FirstChargeDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import DeleteAccountDialog from "@/components/dialogs/DeleteAccountDialog";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useContractGuard } from "@/hooks/ui/useContractGuard";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AtividadeEntidadeTipo, PassageiroFormModes } from "@/types/enums";

import { ReactNode, useEffect, useState } from "react";
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
  OpenReceiptDialogProps,
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

  const [receiptDialogState, setReceiptDialogState] = useState<{
    open: boolean;
    props?: OpenReceiptDialogProps;
  }>({
    open: false,
  });

  const [contractSetupDialogState, setContractSetupDialogState] = useState<{
    open: boolean;
    props?: OpenContractSetupDialogProps;
  }>({
    open: false,
  });
  
  const [alterarSenhaDialogOpen, setAlterarSenhaDialogOpen] = useState(false);
  const [editarCadastroDialogOpen, setEditarCadastroDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

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

  const openCobrancaFormDialog = (props: OpenCobrancaFormProps) => {
    setCobrancaFormDialogState({
      open: true,
      props,
    });
  };

  const openFirstChargeDialog = (props: OpenFirstChargeDialogProps) => setFirstChargeDialogState({ open: true, props });
  const closeFirstChargeDialog = () => safeCloseDialog(() => setFirstChargeDialogState(prev => ({ ...prev, open: false })));

  const openCobrancaHistoryDialog = (props: OpenCobrancaHistoryProps) => setCobrancaHistoryDialogState({ open: true, props });
  const closeCobrancaHistoryDialog = () => safeCloseDialog(() => setCobrancaHistoryDialogState(prev => ({ ...prev, open: false })));

  const openReceiptDialog = (props: OpenReceiptDialogProps) => setReceiptDialogState({ open: true, props });
  const closeReceiptDialog = () => safeCloseDialog(() => setReceiptDialogState(prev => ({ ...prev, open: false })));

  const openContractSetupDialog = (props?: OpenContractSetupDialogProps) => setContractSetupDialogState({ open: true, props });

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
        openCobrancaFormDialog,
        openFirstChargeDialog,
        openCobrancaHistoryDialog,
        openReceiptDialog,
        isFirstChargeDialogOpen: firstChargeDialogState.open,
        openContractSetupDialog,
        openAlterarSenhaDialog: () => setAlterarSenhaDialogOpen(true),
        openEditarCadastroDialog: () => setEditarCadastroDialogOpen(true),
        openDeleteAccountDialog: () => setDeleteAccountDialogOpen(true),
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
        <Dialog 
          open={true} 
          onOpenChange={(open) => {
            if (!open) closeCobrancaHistoryDialog();
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
            <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Histórico da Mensalidade
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="px-5 py-4">
                {cobrancaHistoryDialogState.props && (
                  <ActivityTimeline
                    entidadeTipo={AtividadeEntidadeTipo.COBRANCA}
                    entidadeId={cobrancaHistoryDialogState.props.cobrancaId}
                    limit={10}
                  />
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {receiptDialogState.open && receiptDialogState.props && (
        <ReceiptDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) closeReceiptDialog();
          }}
          url={receiptDialogState.props.url}
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

      {deleteAccountDialogOpen && (
        <DeleteAccountDialog
          isOpen={deleteAccountDialogOpen}
          onClose={() => safeCloseDialog(() => setDeleteAccountDialogOpen(false))}
        />
      )}
    </LayoutContext.Provider>
  );
};
