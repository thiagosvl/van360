import { PassageiroFormModes } from "@/types/enums";
import { Escola } from "@/types/escola";
import { Gasto } from "@/types/gasto";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Veiculo } from "@/types/veiculo";
import {
    createContext,
    useContext,
} from "react";

export interface OpenConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
  onCancel?: () => void;
  allowClose?: boolean;
}

export interface OpenPassageiroFormProps {
  onSuccess?: (passageiro?: Passageiro) => void;
  editingPassageiro?: Passageiro | null;
  mode?: PassageiroFormModes;
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

export interface OpenCobrancaFormProps {
  passageiroId: string;
  passageiroNome?: string;
  passageiroResponsavelNome?: string;
  valorCobranca?: number;
  diaVencimento?: number;
  onSuccess?: () => void;
}

export interface OpenCobrancaEditDialogProps {
  onSuccess?: () => void;
  cobranca: any; // Using any to avoid complex type issues for now, can be Cobranca
}

export interface OpenCobrancaDeleteDialogProps {
  onConfirm: () => void | Promise<void>;
  onEdit: () => void;
  isLoading?: boolean;
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

export interface OpenFirstChargeDialogProps {
  passageiro: Passageiro;
  onSuccess?: () => void;
}

export interface OpenCobrancaHistoryProps {
  cobrancaId: string;
  passageiroNome: string;
}

export interface OpenContractSetupDialogProps {
    forceOpen?: boolean;
    onSuccess?: (usarContratos?: boolean) => void;
}

export interface OpenReceiptDialogProps {
  url?: string | null;
}

export interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;
  
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;
  openEscolaFormDialog: (props?: OpenEscolaFormProps) => void;
  openVeiculoFormDialog: (props?: OpenVeiculoFormProps) => void;
  openPassageiroFormDialog: (props?: OpenPassageiroFormProps) => void;
  openGastoFormDialog: (props?: OpenGastoFormProps) => void;
  openCobrancaDeleteDialog: (props: OpenCobrancaDeleteDialogProps) => void;
  closeCobrancaDeleteDialog: () => void;
  openCobrancaEditDialog: (props: OpenCobrancaEditDialogProps) => void;
  openManualPaymentDialog: (props: OpenManualPaymentDialogProps) => void;
  openCobrancaFormDialog: (props: OpenCobrancaFormProps) => void;
  openFirstChargeDialog: (props: OpenFirstChargeDialogProps) => void;
  openCobrancaHistoryDialog: (props: OpenCobrancaHistoryProps) => void;
  openReceiptDialog: (props: OpenReceiptDialogProps) => void;
  isFirstChargeDialogOpen: boolean;
  
  openContractSetupDialog: (props?: OpenContractSetupDialogProps) => void;
  
  // Perfil / Conta
  openAlterarSenhaDialog: () => void;
  openEditarCadastroDialog: () => void;
  openDeleteAccountDialog: () => void;
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
