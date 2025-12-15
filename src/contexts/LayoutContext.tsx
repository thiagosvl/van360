import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { ContextualUpsellDialog } from "@/components/dialogs/ContextualUpsellDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import LimiteFranquiaDialog from "@/components/dialogs/LimiteFranquiaDialog";
import PlanosDialog from "@/components/dialogs/PlanosDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface OpenLimiteFranquiaDialogProps {
  title?: string;
  description?: string;
  hideLimitInfo?: boolean;
  targetPassengerId?: string;
  onUpgradeSuccess?: () => void;
}

interface OpenContextualUpsellDialogProps {
  feature: "passageiros" | "controle_gastos" | "relatorios" | "outros";
  targetPlan?: "essencial" | "completo"; // Optional, defaults to Completo if not specified
  onSuccess?: () => void;
}

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
  openPlanosDialog: () => void;
  openLimiteFranquiaDialog: (props?: OpenLimiteFranquiaDialogProps) => void;
  isLimiteFranquiaDialogOpen: boolean;
  openContextualUpsellDialog: (props: OpenContextualUpsellDialogProps) => void;
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;
  openEscolaFormDialog: (props?: OpenEscolaFormProps) => void;
  openVeiculoFormDialog: (props?: OpenVeiculoFormProps) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('Carregando...');
  const [pageSubtitle, setPageSubtitle] = useState('Por favor, aguarde.');
  const [isPlanosDialogOpen, setIsPlanosDialogOpen] = useState(false);
  
  // Sync document title with page title
  useEffect(() => {
    if (pageTitle && pageTitle !== 'Carregando...') {
       document.title = `${pageTitle} | Van360`;
    }
  }, [pageTitle]);
  
  // Limite Franquia Dialog State
  const [limiteFranquiaDialogState, setLimiteFranquiaDialogState] = useState<{
    open: boolean;
    props?: OpenLimiteFranquiaDialogProps;
  }>({
    open: false,
  });

  // Contextual Upsell Dialog State
  const [contextualUpsellDialogState, setContextualUpsellDialogState] = useState<{
      open: boolean;
      props?: OpenContextualUpsellDialogProps;
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
  const { profile } = useProfile(user?.id);
  
  // Carregar dados de franquia globalmente se o dialog estiver aberto
  // Isso garante que temos os números "Limite X de Y" atualizados
  // Carregar dados de franquia globalmente se o dialog estiver aberto
  // Isso garante que temos os números "Limite X de Y" atualizados
  const { limits } = usePlanLimits({
      userUid: user?.id,
      profile
  });

  const validacaoFranquia = {
      franquiaContratada: limits.franchise.limit,
      cobrancasEmUso: limits.franchise.used
  };

  const openPlanosDialog = () => setIsPlanosDialogOpen(true);
  
  const openLimiteFranquiaDialog = (props?: OpenLimiteFranquiaDialogProps) => {
    setLimiteFranquiaDialogState({
      open: true,
      props,
    });
  };

  const openContextualUpsellDialog = (props: OpenContextualUpsellDialogProps) => {
      setContextualUpsellDialogState({
          open: true,
          props
      });
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
      openPlanosDialog,
      openLimiteFranquiaDialog,
      isLimiteFranquiaDialogOpen: limiteFranquiaDialogState.open,
      openContextualUpsellDialog,
      openConfirmationDialog,
      closeConfirmationDialog,
      openEscolaFormDialog,
      openVeiculoFormDialog
    }}>
      {children}
      <PlanosDialog 
        isOpen={isPlanosDialogOpen} 
        onOpenChange={setIsPlanosDialogOpen} 
      />
      <LimiteFranquiaDialog
        open={limiteFranquiaDialogState.open}
        onOpenChange={(open) => setLimiteFranquiaDialogState(prev => ({ ...prev, open }))}
        franquiaContratada={validacaoFranquia.franquiaContratada}
        cobrancasEmUso={validacaoFranquia.cobrancasEmUso}
        usuarioId={profile?.id}
        // Repassando props customizadas (titulo, descrição, etc)
        title={limiteFranquiaDialogState.props?.title}
        description={limiteFranquiaDialogState.props?.description}
        hideLimitInfo={limiteFranquiaDialogState.props?.hideLimitInfo}
        targetPassengerId={limiteFranquiaDialogState.props?.targetPassengerId}
        onUpgradeSuccess={limiteFranquiaDialogState.props?.onUpgradeSuccess}
      />
      
      {contextualUpsellDialogState.props && (
        <ContextualUpsellDialog
            open={contextualUpsellDialogState.open}
            onOpenChange={(open) => setContextualUpsellDialogState(prev => ({ ...prev, open }))}
            feature={contextualUpsellDialogState.props.feature}
            targetPlan={contextualUpsellDialogState.props.targetPlan || "completo"} // Default to Completo
            onViewAllPlans={() => {
                // setContextualUpsellDialogState(prev => ({ ...prev, open: false }));
                setTimeout(() => setIsPlanosDialogOpen(true), 150);
            }}
            onSuccess={contextualUpsellDialogState.props.onSuccess}
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