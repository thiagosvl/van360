import { PassageiroFormModes, SubscriptionIdentifer } from "@/types/enums";
import { Escola } from "@/types/escola";
import { Gasto } from "@/types/gasto";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { SaaSPlan } from "@/types/subscription";
import { Veiculo } from "@/types/veiculo";
import { RegistrarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import {
  createContext,
  useContext,
} from "react";

export interface OpenConfirmationDialogProps {
  title: string;
  description: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
  onCancel?: () => void;
  allowClose?: boolean;
}

export interface OpenDefinirResponsavelPrincipalProps {
  responsavelNome: string;
  passageiroNome: string;
  onConfirm: () => Promise<void> | void;
}

export interface OpenPassageiroFormProps {
  onSuccess?: (
    passageiro?: Passageiro,
    meta?: { formData?: Record<string, unknown>; hasCriticalContractChanges?: boolean }
  ) => void;
  editingPassageiro?: Passageiro | null;
  mode?: PassageiroFormModes;
  prePassageiro?: PrePassageiro | null;
}

export interface OpenQuickStartPassageiroProps {
  onSuccess?: (passageiro?: Passageiro) => void;
  isOnboarding?: boolean;
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
  mes?: number;
  ano?: number;
  lockFoiPago?: boolean;
  lockMesAno?: boolean;
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
  onPaymentRecorded?: (updatedCobranca?: any, dataSent?: RegistrarPagamentoManualDTO) => void;
}

export interface OpenReceiptDialogProps {
  receiptUrl: string;
  cobrancaDescricao?: string;
}

export interface OpenFirstChargeDialogProps {
  passageiro: Passageiro;
  onSuccess?: () => void;
}

export interface OpenContractSetupDialogProps {
  forceOpen?: boolean;
  onSuccess?: (usarContratos?: boolean) => void;
}

export interface OpenGerarContratoValidadorDialogProps {
  passageiroId: string;
  onSuccess: (passageiroId: string, bypassed?: boolean) => void;
}

export interface OpenImportarContratoDialogProps {
  passageiroId?: string;
  passageiro?: Passageiro;
  onSuccess?: () => void;
}

export interface OpenPixPaymentDialogProps {
  qrcode: string;
  imagem_qrcode: string;
  txid: string;
  valor: number;
  onSuccess?: () => void;
}

export interface OpenSaaSCheckoutDialogProps {
  plans: SaaSPlan[];
  initialPlanId?: string;
  onSuccess?: () => void;
  forcedPeriod?: SubscriptionIdentifer;
}

export interface OpenResponsavelFormProps {
  passageiroId: string;
  editingResponsavel?: PassageiroResponsavel | null;
  onSuccess?: () => void;
  isResponsavelPortal?: boolean;
}

export interface OpenRouteFormProps {
  editingRoute?: {
    nome: string;
    veiculoId: string;
    escolaFixaId?: string;
  } | null;
  onSuccess: (data: {
    nome: string;
    veiculoId: string;
    escolaFixaId?: string;
  }) => void;
}

export interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;

  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;
  openDefinirResponsavelPrincipalDialog: (props: OpenDefinirResponsavelPrincipalProps) => void;
  closeDefinirResponsavelPrincipalDialog: () => void;
  openEscolaFormDialog: (props?: OpenEscolaFormProps) => void;
  openVeiculoFormDialog: (props?: OpenVeiculoFormProps) => void;
  openPassageiroFormDialog: (props?: OpenPassageiroFormProps) => void;
  openRouteFormDialog: (props: OpenRouteFormProps) => void;
  openQuickStartPassageiroDialog: (props?: OpenQuickStartPassageiroProps) => void;
  openGastoFormDialog: (props?: OpenGastoFormProps) => void;
  openGerenciarCategoriasDialog: (props?: { usuarioId?: string }) => void;
  openResponsavelFormDialog: (props: OpenResponsavelFormProps) => void;
  openCobrancaDeleteDialog: (props: OpenCobrancaDeleteDialogProps) => void;
  closeCobrancaDeleteDialog: () => void;
  openCobrancaEditDialog: (props: OpenCobrancaEditDialogProps) => void;
  openManualPaymentDialog: (props: OpenManualPaymentDialogProps) => void;
  openReceiptDialog: (props: OpenReceiptDialogProps) => void;
  openCobrancaFormDialog: (props: OpenCobrancaFormProps) => void;
  openFirstChargeDialog: (props: OpenFirstChargeDialogProps) => void;
  openPixPaymentDialog: (props: OpenPixPaymentDialogProps) => void;
  openSaaSCheckoutDialog: (props: OpenSaaSCheckoutDialogProps) => void;
  openAdminCreateUserDialog: (onSuccess?: (userId: string) => void) => void;

  isFirstChargeDialogOpen: boolean;

  openContractSetupDialog: (props?: OpenContractSetupDialogProps) => void;
  openGerarContratoValidadorDialog: (props: OpenGerarContratoValidadorDialogProps) => void;
  openImportarContratoDialog: (props?: OpenImportarContratoDialogProps) => void;

  // Perfil / Conta
  openAlterarSenhaDialog: () => void;
  openEditarPixDialog: () => void;
  openAcquisitionChannelDialog: () => void;
  openReferAndEarnDialog: () => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;

  // Loading Global
  isGlobalLoading: boolean;
  setIsGlobalLoading: (active: boolean, text?: string) => void;
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
