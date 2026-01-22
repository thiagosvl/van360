import {
  PlanUpgradeDialogProps,
} from "@/components/dialogs/PlanUpgradeDialog";
import { SubscriptionExpiredDialogProps } from "@/components/dialogs/SubscriptionExpiredDialog";
import { Escola } from "@/types/escola";
import { Gasto } from "@/types/gasto";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Veiculo } from "@/types/veiculo";
import {
  createContext,
  useContext,
} from "react";

export type OpenPlanUpgradeDialogProps = Omit<
  PlanUpgradeDialogProps,
  "open" | "onOpenChange"
> & {
  onClose?: () => void;
  title?: string;
  description?: string;
  defaultTab?: string;
  feature?: string;
  targetPassengerCount?: number;
  onSuccess?: () => void;
};

export type OpenSubscriptionExpiredDialogProps = Omit<
  SubscriptionExpiredDialogProps,
  "open" | "onOpenChange"
>;

export interface OpenConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
  onCancel?: () => void;
}

export interface OpenPassageiroFormProps {
  onSuccess?: () => void;
  editingPassageiro?: Passageiro | null;
  mode?: "create" | "edit" | "finalize";
  prePassageiro?: PrePassageiro | null;
}

export interface OpenGastoFormProps {
  onSuccess?: () => void;
  gastoToEdit?: Gasto | null;
  veiculos?: { id: string; placa: string }[];
  usuarioId?: string;
}

export interface OpenEscolaFormProps {
  onSuccess?: (escola: Escola, keepOpen?: boolean) => void;
  editingEscola?: Escola | null;
  allowBatchCreation?: boolean;
}

export interface OpenVeiculoFormProps {
  onSuccess?: (veiculo: Veiculo, keepOpen?: boolean) => void;
  editingVeiculo?: Veiculo | null;
  allowBatchCreation?: boolean;
}

export interface OpenCobrancaEditDialogProps {
  onSuccess?: () => void;
  cobranca: any; // Using any to avoid complex type issues for now, can be Cobranca
}

export interface OpenCobrancaPixDrawerProps {
  qrCodePayload: string;
  valor: number;
  passageiroNome: string;
  mes?: number;
  ano?: number;
}

export interface OpenManualPaymentDialogProps {
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome: string;
  valorOriginal: number;
  status: string;
  dataVencimento: string;
  onPaymentRecorded: () => void;
}

export interface LayoutContextType {
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
  openPassageiroFormDialog: (props?: OpenPassageiroFormProps) => void;
  openGastoFormDialog: (props?: OpenGastoFormProps) => void;
  openPixKeyDialog: (options?: {
    onSuccess?: () => void;
    canClose?: boolean;
  }) => void;
  closePixKeyDialog: () => void;
  isPixKeyDialogOpen: boolean;
  openWhatsappDialog: (options?: { canClose?: boolean }) => void;
  openCobrancaEditDialog: (props: OpenCobrancaEditDialogProps) => void;
  openCobrancaPixDrawer: (props: OpenCobrancaPixDrawerProps) => void;
  openManualPaymentDialog: (props: OpenManualPaymentDialogProps) => void;
  openSubscriptionExpiredDialog: (props?: OpenSubscriptionExpiredDialogProps) => void;
  isSubscriptionExpiredDialogOpen: boolean;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout deve ser usado dentro de um LayoutProvider");
  }
  return context;
};

export const useLayoutSafe = () => {
  return useContext(LayoutContext);
};
