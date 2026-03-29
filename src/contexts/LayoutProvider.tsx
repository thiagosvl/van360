import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import AlterarSenhaDialog from "@/components/dialogs/AlterarSenhaDialog";
import CobrancaDeleteDialog from "@/components/dialogs/CobrancaDeleteDialog";
import CobrancaDialog from "@/components/dialogs/CobrancaDialog";
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import ContractSetupDialog from "@/components/dialogs/ContractSetupDialog";
import DeleteAccountDialog from "@/components/dialogs/DeleteAccountDialog";
import EditarCadastroDialog from "@/components/dialogs/EditarCadastroDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import FirstChargeDialog from "@/components/dialogs/FirstChargeDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import GenerateContractDialog from "@/components/dialogs/GenerateContractDialog";
import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import UpdateContractDialog from "@/components/dialogs/UpdateContractDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useContractGuard } from "@/hooks/ui/useContractGuard";
import { AtividadeEntidadeTipo, PassageiroFormModes } from "@/types/enums";
import { History } from "lucide-react";

import { X } from "lucide-react";
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
  OpenGenerateContractDialogProps,
  OpenManualPaymentDialogProps,
  OpenPassageiroFormProps,
  OpenUpdateContractDialogProps,
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

  const [contractSetupDialogState, setContractSetupDialogState] = useState<{
    open: boolean;
    props?: OpenContractSetupDialogProps;
  }>({
    open: false,
  });

  const [updateContractDialogState, setUpdateContractDialogState] = useState<{
    open: boolean;
    props?: OpenUpdateContractDialogProps;
  }>({
    open: false,
  });

  const [generateContractDialogState, setGenerateContractDialogState] = useState<{
    open: boolean;
    props?: OpenGenerateContractDialogProps;
  }>({
    open: false,
  });

  const [alterarSenhaDialogOpen, setAlterarSenhaDialogOpen] = useState(false);
  const [editarCadastroDialogOpen, setEditarCadastroDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGlobalLoading, setIsGlobalLoadingState] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState<string | undefined>();

  const usarContratos = profile?.config_contrato?.usar_contratos;

  const handleContractGuardOpen = useCallback(() => {
    setContractSetupDialogState({ open: true });
  }, []);

  useContractGuard({
    profile,
    isLoading: isProfileLoading,
    onShouldOpen: handleContractGuardOpen,
    disabled: usarContratos === false || isProfileLoading || !profile,
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

  const openCobrancaHistoryDialog = (props: OpenCobrancaHistoryProps) => setCobrancaHistoryDialogState({ open: true, props });
  const closeCobrancaHistoryDialog = () => safeCloseDialog(() => setCobrancaHistoryDialogState(prev => ({ ...prev, open: false })));

  const openContractSetupDialog = (props?: OpenContractSetupDialogProps) => {
    setContractSetupDialogState({ open: true, props });
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
        openCobrancaFormDialog,
        openFirstChargeDialog,
        openCobrancaHistoryDialog,
        openUpdateContractDialog: (props: OpenUpdateContractDialogProps) => setUpdateContractDialogState({ open: true, props }),
        openGenerateContractDialog: (props: OpenGenerateContractDialogProps) => setGenerateContractDialogState({ open: true, props }),
        isFirstChargeDialogOpen: firstChargeDialogState.open,
        openContractSetupDialog,
        openAlterarSenhaDialog: () => setAlterarSenhaDialogOpen(true),
        openEditarCadastroDialog: () => setEditarCadastroDialogOpen(true),
        openDeleteAccountDialog: () => setDeleteAccountDialogOpen(true),
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

      <LoadingOverlay active={isGlobalLoading} text={globalLoadingText} />

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
          <DialogContent
            className="w-[calc(100%-2rem)] max-w-sm rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-soft-2xl"
            hideCloseButton
          >
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100/50 bg-white/70 backdrop-blur-md sticky top-0 z-20 flex-row items-center justify-between space-y-0">
              <DialogTitle className="text-lg font-black flex items-center gap-3 font-headline text-foreground/80">
                <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                  <History className="w-5 h-5" />
                </div>
                Histórico
              </DialogTitle>
              <DialogClose className="p-2 rounded-full hover:bg-gray-100 transition-colors text-foreground/30 hover:text-foreground/60">
                <X className="w-5 h-5" />
              </DialogClose>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh]">
              <div className="px-6 py-4 bg-gray-50/20">
                {cobrancaHistoryDialogState.props && (
                  <ActivityTimeline
                    entidadeTipo={AtividadeEntidadeTipo.COBRANCA}
                    entidadeId={cobrancaHistoryDialogState.props.cobrancaId}
                    limit={15}
                  />
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
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

      {deleteAccountDialogOpen && (
        <DeleteAccountDialog
          isOpen={deleteAccountDialogOpen}
          onClose={() => safeCloseDialog(() => setDeleteAccountDialogOpen(false))}
        />
      )}

      {updateContractDialogState.open && updateContractDialogState.props && (
        <UpdateContractDialog
          isOpen={true}
          onClose={() => setUpdateContractDialogState({ open: false })}
          passageiro={updateContractDialogState.props.passageiro}
        />
      )}

      {generateContractDialogState.open && generateContractDialogState.props && (
        <GenerateContractDialog
          isOpen={true}
          onClose={() => setGenerateContractDialogState({ open: false })}
          passageiro={generateContractDialogState.props.passageiro}
        />
      )}
    </LayoutContext.Provider>
  );
};
