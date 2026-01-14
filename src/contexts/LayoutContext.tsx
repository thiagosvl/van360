import {
    PlanUpgradeDialogProps,
} from "@/components/dialogs/PlanUpgradeDialog";
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
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout deve ser usado dentro de um LayoutProvider");
  }
  return context;
};
