import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import PixKeyDialog from "@/components/dialogs/PixKeyDialog";
import { PlanUpgradeDialog, PlanUpgradeDialogProps } from "@/components/dialogs/PlanUpgradeDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import { WhatsappDialog } from "@/components/dialogs/WhatsappDialog";
import { FEATURE_COBRANCA_AUTOMATICA, FEATURE_GASTOS, FEATURE_LIMITE_PASSAGEIROS, FEATURE_NOTIFICACOES, FEATURE_RELATORIOS, PLANO_PROFISSIONAL } from "@/constants";
import { usePixKeyGuard } from "@/hooks/business/usePixKeyGuard";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useWhatsappGuard } from "@/hooks/business/useWhatsappGuard";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type OpenPlanUpgradeDialogProps = Omit<PlanUpgradeDialogProps, "open" | "onOpenChange"> & { 
  onClose?: () => void;
  title?: string;
  description?: string;
};

interface OpenConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
}

interface OpenEscolaFormProps {
  onSuccess?: (escola: Escola, keepOpen?: boolean) => void;
  editingEscola?: Escola | null;
  allowBatchCreation?: boolean;
}

interface OpenVeiculoFormProps {
  onSuccess?: (veiculo: Veiculo) => void;
  editingVeiculo?: Veiculo | null;
}

interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;
  openPlanUpgradeDialog: (props?: OpenPlanUpgradeDialogProps) => void;
  isPlanUpgradeDialogOpen: boolean;
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;
  openEscolaFormDialog: (props?: OpenEscolaFormProps) => void;
  openVeiculoFormDialog: (props?: OpenVeiculoFormProps) => void;
  openPixKeyDialog: (options?: { onSuccess?: () => void, canClose?: boolean }) => void;
  closePixKeyDialog: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('Carregando...');
  const [pageSubtitle, setPageSubtitle] = useState('Por favor, aguarde.');
  
  // Sync document title with page title
  useEffect(() => {
    if (pageTitle && pageTitle !== 'Carregando...') {
       document.title = `${pageTitle} | Van360`;
    }
  }, [pageTitle]);
  
  // Novo Plan Upgrade Dialog State (Unificado)
  const [planUpgradeDialogState, setPlanUpgradeDialogState] = useState<{
      open: boolean;
      props?: OpenPlanUpgradeDialogProps;
  }>({
      open: false
  });

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

  const { user } = useSession();
  const { profile, isProfissional, isLoading: isProfileLoading } = useProfile(user?.id);
  
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { limits } = usePlanLimits({
      userUid: user?.id,
      profile
  });

  // Global Check for Pix Key (Professional Plan)
  usePixKeyGuard({
      profile,
      isProfissional: !!isProfissional,
      isLoading: isProfileLoading,
      onShouldOpen: () => {
          setPixKeyDialogState({
              open: true,
              canClose: false
          });
      }
  });

  // Global Check for Whatsapp (Professional Plan)
  useWhatsappGuard({
    isProfissional: !!isProfissional,
    isLoading: isProfileLoading,
    onShouldOpen: () => {
       // Só abre se não tiver outros dialogs críticos abertos (evitar sobreposição chata)
       // Mas o requisito é "SEMPRE". Vamos permitir a sobreposição ou gerenciar prioridade?
       // Vamos priorizar PIX, se PIX estiver ok, mostra Whatsapp.
       if (!pixKeyDialogState.open) {
          setWhatsappDialogState({ open: true, canClose: false });
       }
    }
  });
  
  // PixKey Dialog State (Global)
  const [pixKeyDialogState, setPixKeyDialogState] = useState<{
    open: boolean;
    onSuccess?: () => void;
    canClose?: boolean;
  }>({
    open: false,
    canClose: true
  });

  // Whatsapp Dialog State (Global)
  const [whatsappDialogState, setWhatsappDialogState] = useState<{
    open: boolean;
    canClose?: boolean;
  }>({
    open: false,
    canClose: true
  });

  const openPlanUpgradeDialog = (props?: OpenPlanUpgradeDialogProps) => {
    // ... existing logic ...
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
              defaultTab
          }
      });
  };

  const openPixKeyDialog = (options?: { onSuccess?: () => void, canClose?: boolean }) => {
    setPixKeyDialogState({
      open: true,
      onSuccess: options?.onSuccess,
      canClose: options?.canClose ?? true
    });
  };

  const closePixKeyDialog = () => {
    setPixKeyDialogState(prev => ({ ...prev, open: false }));
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

  return (
    <LayoutContext.Provider value={{ 
      pageTitle, 
      setPageTitle, 
      pageSubtitle, 
      setPageSubtitle, 
      openPlanUpgradeDialog,
      isPlanUpgradeDialogOpen: planUpgradeDialogState.open,
      openConfirmationDialog,
      closeConfirmationDialog,
      openEscolaFormDialog,
      openVeiculoFormDialog,
      openPixKeyDialog,
      closePixKeyDialog
    }}>
      {children}
      
      {planUpgradeDialogState.open && (
         <PlanUpgradeDialog
            open={planUpgradeDialogState.open}
            onOpenChange={(open) => {
                setPlanUpgradeDialogState(prev => ({ ...prev, open }));
                if (!open) {
                    planUpgradeDialogState.props?.onClose?.();
                }
            }}
            defaultTab={planUpgradeDialogState.props?.defaultTab}
            feature={planUpgradeDialogState.props?.feature}
            targetPassengerCount={planUpgradeDialogState.props?.targetPassengerCount}
            onSuccess={planUpgradeDialogState.props?.onSuccess}
            title={planUpgradeDialogState.props?.title}
            description={planUpgradeDialogState.props?.description}
         />
      )}

      {confirmationDialogState.props && (
        <ConfirmationDialog
          open={confirmationDialogState.open}
          onOpenChange={(open) =>
            setConfirmationDialogState((prev) => ({ ...prev, open }))
          }
          title={confirmationDialogState.props.title}
          description={confirmationDialogState.props.description}
          onConfirm={confirmationDialogState.props.onConfirm}
          confirmText={confirmationDialogState.props.confirmText}
          cancelText={confirmationDialogState.props.cancelText}
          variant={confirmationDialogState.props.variant}
          isLoading={confirmationDialogState.props.isLoading}
        />
      )}
      
      <EscolaFormDialog
        isOpen={escolaFormDialogState.open}
        onClose={() => setEscolaFormDialogState(prev => ({ ...prev, open: false }))}
        onSuccess={(escola, keepOpen) => {
            if (!keepOpen) {
                setEscolaFormDialogState(prev => ({ ...prev, open: false }));
            }
            escolaFormDialogState.props?.onSuccess?.(escola, keepOpen);
        }}
        editingEscola={escolaFormDialogState.props?.editingEscola}
        profile={profile}
        allowBatchCreation={
          escolaFormDialogState.props?.allowBatchCreation
        }
      />

      <VeiculoFormDialog
        isOpen={veiculoFormDialogState.open}
        onClose={() => setVeiculoFormDialogState(prev => ({ ...prev, open: false }))}
        onSuccess={(veiculo) => {
            setVeiculoFormDialogState(prev => ({ ...prev, open: false }));
            veiculoFormDialogState.props?.onSuccess?.(veiculo);
        }}
        editingVeiculo={veiculoFormDialogState.props?.editingVeiculo}
        profile={profile}
      />

      <PixKeyDialog
        isOpen={pixKeyDialogState.open}
        onClose={() => setPixKeyDialogState(prev => ({ ...prev, open: false }))}
        canClose={pixKeyDialogState.canClose}
        onSuccess={() => {
            pixKeyDialogState.onSuccess?.();
            // Optional: Close on success if not handled by dialog itself, but PixKeyDialog handles it usually?
            // PixKeyDialog calls onClose() internally on success.
            // But let's ensure state sync.
            // Actually PixKeyDialog calls onSuccess then onClose. 
            // So onClose here updates state to false. correctness verified.
        }}
      />
      
      <WhatsappDialog 
         isOpen={whatsappDialogState.open}
         onClose={() => setWhatsappDialogState(prev => ({ ...prev, open: false }))}
         canClose={whatsappDialogState.canClose}
      />
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};