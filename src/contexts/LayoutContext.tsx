import { Cobranca } from "@/types/cobranca";
import { PassageiroFormModes, PassageiroGenero, SubscriptionIdentifer } from "@/types/enums";
import { Escola } from "@/types/escola";
import { Gasto } from "@/types/gasto";
import { Passageiro, PassageiroResponsavel } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { SaaSPlan } from "@/types/subscription";
import { Veiculo } from "@/types/veiculo";
import { RegistrarPagamentoManualDTO, ComplementarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import type { AdminUserPassengerItem } from "@/services/api/admin.api";
import type { ShowcaseTabType } from "@/components/features/demonstracoes/WhatsAppShowcaseEmulator";
import type { FretamentoDetalhes, FretamentoParticipante } from "@/services/api/fretamento.api";
import {
  createContext,
  useContext,
} from "react";

export interface OpenFretamentoFormProps {
  editingItem?: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export interface OpenPasseioFormProps {
  editingItem?: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export interface OpenNovoFretamentoOuPasseioProps {
  onSelectFretamento: () => void;
  onSelectPasseio: () => void;
}

export interface OpenRegistrarPagamentoFretamentoProps {
  fretamento: FretamentoDetalhes;
  onSuccess?: () => void;
}

export interface OpenAdicionarParticipantePasseioProps {
  fretamento: FretamentoDetalhes;
  onSuccess?: () => void;
}

export interface OpenRegistrarPagamentoParticipanteProps {
  fretamentoId: string;
  passeioTitulo?: string;
  participante: FretamentoParticipante;
  onSuccess?: () => void;
}

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

export interface OpenRevisarSolicitacaoProps {
  prePassageiro: PrePassageiro;
  onSuccess?: (passageiro: Passageiro) => void;
}

export interface OpenQuickStartPassageiroProps {
  onSuccess?: (passageiro?: Passageiro, keepOpen?: boolean) => void;
  isOnboarding?: boolean;
}

export interface OpenPassageiroFinanceiroProps {
  passageiro: Passageiro | Partial<Passageiro>;
  onSuccess?: () => void;
}

export interface OpenPassageiroEscolaProps {
  passageiro: Passageiro | Partial<Passageiro>;
  onSuccess?: () => void;
}

export interface OpenPassageiroTransporteProps {
  passageiro: Passageiro | Partial<Passageiro>;
  onSuccess?: () => void;
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

export interface OpenCadastrarEscolasProps {
  onSuccess?: (primeiraEscola: Escola, todasEscolas: Escola[]) => void;
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
  availableMonths?: number[];
  onSuccess?: () => void;
}

export interface OpenCobrancaEditDialogProps {
  onSuccess?: () => void;
  cobranca: Cobranca;
}

export interface OpenCobrancaDeleteDialogProps {
  onConfirm: () => void | Promise<void>;
  onEdit?: () => void;
  isLoading?: boolean;
}



export interface OpenManualPaymentDialogProps {
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome: string;
  valorOriginal: number;
  status: string;
  dataVencimento: string;
  observacao?: string | null;
  onPaymentRecorded?: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: RegistrarPagamentoManualDTO) => void;
}

export interface OpenComplementarPagamentoDialogProps {
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome?: string;
  valorOriginal: number;
  valorJaPago: number;
  dataVencimento: string;
  mes?: number;
  ano?: number;
  observacao?: string | null;
  onPaymentRecorded?: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: ComplementarPagamentoManualDTO) => void;
}

export interface OpenReceiptDialogProps {
  receiptUrl: string;
  cobrancaDescricao?: string;
  cobrancaId?: string;
  mes?: number;
  ano?: number;
  passageiroId?: string;
  nomePassageiro?: string;
  nomeResponsavel?: string | null;
  generoPassageiro?: PassageiroGenero | string | null;
}

export interface OpenAnnualReceiptDialogProps {
  receiptUrl: string;
  ano: number;
  alunoNome?: string;
  passageiroId?: string;
}

export interface OpenFirstChargeDialogProps {
  passageiro: Passageiro;
  isFirstPassageiro?: boolean;
  onSuccess?: (passageiro?: Passageiro) => void;
}

export interface OpenContractSetupDialogProps {
  forceOpen?: boolean;
  onSuccess?: (usarContratos?: boolean) => void;
}

export interface OpenConfirmarGerarContratoDialogProps {
  passageiro: Passageiro;
  valorMensal?: number;
  diaVencimento?: number;
  dataInicio?: string;
  dataFim?: string;
  isSubstituicao?: boolean;
  contratoIdParaSubstituir?: string;
  onSuccess?: () => void;
}

export interface OpenGerarContratoValidadorDialogProps {
  passageiroId: string;
  initialPassageiro?: Passageiro;
  onSuccess: (
    passageiroId: string,
    bypassed?: boolean,
    updatedValues?: { valorMensal?: number; diaVencimento?: number }
  ) => void;
}

export interface OpenImportarContratoDialogProps {
  passageiroId?: string;
  passageiro?: Passageiro;
  onSuccess?: () => void;
}

export interface OpenRegistrarAusenciaProps {
  lockedRotaId?: string;
  lockedPassageiro?: { id: string; nome: string };
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

export interface OpenAdminDispatchNotificationDialogProps {
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
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

export interface OpenAdminPassengerNotificationsDialogProps {
  passageiroId: string;
  passageiroNome: string;
}

export interface OpenAdminPassengerSendCobrancaDialogProps {
  userId: string;
  passageiro: AdminUserPassengerItem;
  motoristaNome?: string;
}

export interface OpenAdminDriverCobrancaDemoDialogProps {
  userId: string;
  userName: string;
  userPhone?: string;
  userApelido?: string;
  userChavePix?: string;
  userTipoChavePix?: string;
}

export interface OpenAdminVencimentoDetalhesDialogProps {
  dia: number;
  mes?: number;
  ano?: number;
}

export interface OpenAdminConfigureReferralDialogProps {
  userId: string;
  userName: string;
  currentIndicadorId?: string | null;
  currentIndicadorNome?: string | null;
  onSuccess?: () => void;
}

export interface OpenAdminUserActivityHistoryDialogProps {
  userId: string;
  userName: string;
  userPhone?: string | null;
  dataInicio?: string;
  dataFim?: string;
}

export interface VideoStoryItem {
  url: string;
  title?: string;
}

export interface OpenVideoStoriesDialogProps {
  videos?: (string | VideoStoryItem)[];
  videosData?: VideoStoryItem[];
  videoUrls?: string[];
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  showCta?: boolean;
  loop?: boolean;
}

export interface OpenWhatsAppCobrancaPreviewDialogProps {
  driverName?: string;
  passageiroNome?: string;
  userChavePix?: string | null;
  showPixSetupAction?: boolean;
}

export interface OpenWhatsAppContratoPreviewDialogProps {
  driverName?: string;
  passageiroNome?: string;
}

export interface OpenReciboPreviewDialogProps {
  driverName?: string;
  passageiroNome?: string;
}

export interface OpenWhatsAppShowcaseDialogProps {
  initialTab?: ShowcaseTabType;
  driverName?: string;
  passageiroNome?: string;
}

export interface OpenOnboardingSuccessDialogProps {
  onNavigateToPassageiro: () => void;
  passageiroNome?: string;
}

export interface OpenAdminConfirmBroadcastDialogProps {
  publicoDescricao: string;
  totalEligivel: number;
  totalComPush: number;
  selectedActionConfig?: { label: string; route: string } | null;
  notificationTitle: string;
  notificationMessage: string;
  onConfirm: () => Promise<void> | void;
  isSubmitting?: boolean;
}

export interface OpenImageFullscreenProps {
  imageUrl: string;
  alt?: string;
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
  openCadastrarEscolasDialog: (props?: OpenCadastrarEscolasProps) => void;
  closeCadastrarEscolasDialog: () => void;
  openVeiculoFormDialog: (props?: OpenVeiculoFormProps) => void;
  openPassageiroFormDialog: (props?: OpenPassageiroFormProps) => void;
  openRevisarSolicitacaoDialog: (props: OpenRevisarSolicitacaoProps) => void;
  closeRevisarSolicitacaoDialog: () => void;
  openRouteFormDialog: (props: OpenRouteFormProps) => void;
  openQuickStartPassageiroDialog: (props?: OpenQuickStartPassageiroProps) => void;
  openPassageiroFinanceiroDialog: (props: OpenPassageiroFinanceiroProps) => void;
  closePassageiroFinanceiroDialog: () => void;
  openPassageiroEscolaDialog: (props: OpenPassageiroEscolaProps) => void;
  closePassageiroEscolaDialog: () => void;
  openPassageiroTransporteDialog: (props: OpenPassageiroTransporteProps) => void;
  closePassageiroTransporteDialog: () => void;
  openRegistrarAusenciaDialog: (props?: OpenRegistrarAusenciaProps) => void;
  closeRegistrarAusenciaDialog: () => void;
  openGastoFormDialog: (props?: OpenGastoFormProps) => void;
  openGerenciarCategoriasDialog: (props?: { usuarioId?: string }) => void;

  // Fretamentos e Passeios
  openFretamentoFormDialog: (props?: OpenFretamentoFormProps) => void;
  closeFretamentoFormDialog: () => void;
  openPasseioFormDialog: (props?: OpenPasseioFormProps) => void;
  closePasseioFormDialog: () => void;
  openNovoFretamentoOuPasseioDialog: (props?: OpenNovoFretamentoOuPasseioProps) => void;
  closeNovoFretamentoOuPasseioDialog: () => void;
  openRegistrarPagamentoFretamentoDialog: (props: OpenRegistrarPagamentoFretamentoProps) => void;
  closeRegistrarPagamentoFretamentoDialog: () => void;
  openAdicionarParticipantePasseioDialog: (props: OpenAdicionarParticipantePasseioProps) => void;
  closeAdicionarParticipantePasseioDialog: () => void;
  openRegistrarPagamentoParticipanteDialog: (props: OpenRegistrarPagamentoParticipanteProps) => void;
  closeRegistrarPagamentoParticipanteDialog: () => void;

  openResponsavelFormDialog: (props: OpenResponsavelFormProps) => void;
  openCobrancaDeleteDialog: (props: OpenCobrancaDeleteDialogProps) => void;
  closeCobrancaDeleteDialog: () => void;
  openCobrancaEditDialog: (props: OpenCobrancaEditDialogProps) => void;
  openManualPaymentDialog: (props: OpenManualPaymentDialogProps) => void;
  openComplementarPagamentoDialog: (props: OpenComplementarPagamentoDialogProps) => void;
  closeComplementarPagamentoDialog: () => void;
  openReceiptDialog: (props: OpenReceiptDialogProps) => void;
  openAnnualReceiptDialog: (props: OpenAnnualReceiptDialogProps) => void;
  openCobrancaFormDialog: (props: OpenCobrancaFormProps) => void;
  openFirstChargeDialog: (props: OpenFirstChargeDialogProps) => void;
  openPixPaymentDialog: (props: OpenPixPaymentDialogProps) => void;
  openSaaSCheckoutDialog: (props: OpenSaaSCheckoutDialogProps) => void;
  openAdminCreateUserDialog: (onSuccess?: (userId: string) => void) => void;
  openAdminDispatchNotificationDialog: (props: OpenAdminDispatchNotificationDialogProps) => void;
  openAdminPassengerNotificationsDialog: (props: OpenAdminPassengerNotificationsDialogProps) => void;
  openAdminPassengerSendCobrancaDialog: (props: OpenAdminPassengerSendCobrancaDialogProps) => void;
  openAdminDriverCobrancaDemoDialog: (props: OpenAdminDriverCobrancaDemoDialogProps) => void;
  openAdminVencimentoDetalhesDialog: (props: OpenAdminVencimentoDetalhesDialogProps) => void;
  openAdminConfigureReferralDialog: (props: OpenAdminConfigureReferralDialogProps) => void;
  openAdminUserActivityHistoryDialog: (props: OpenAdminUserActivityHistoryDialogProps) => void;
  openAdminConfirmBroadcastDialog: (props: OpenAdminConfirmBroadcastDialogProps) => void;
  closeAdminConfirmBroadcastDialog: () => void;
  openImageFullscreen: (props: OpenImageFullscreenProps) => void;
  closeImageFullscreen: () => void;

  isFirstChargeDialogOpen: boolean;

  openContractSetupDialog: (props?: OpenContractSetupDialogProps) => void;
  openConfirmarGerarContratoDialog: (props: OpenConfirmarGerarContratoDialogProps) => void;
  closeConfirmarGerarContratoDialog: () => void;
  openGerarContratoValidadorDialog: (props: OpenGerarContratoValidadorDialogProps) => void;
  openImportarContratoDialog: (props?: OpenImportarContratoDialogProps) => void;

  openVideoStoriesDialog: (props: OpenVideoStoriesDialogProps) => void;
  closeVideoStoriesDialog: () => void;

  // Perfil / Conta
  openAlterarSenhaDialog: () => void;
  openEditarPixDialog: () => void;
  openWhatsAppCobrancaPreviewDialog: (props?: OpenWhatsAppCobrancaPreviewDialogProps) => void;
  openWhatsAppContratoPreviewDialog: (props?: OpenWhatsAppContratoPreviewDialogProps) => void;
  openReciboPreviewDialog: (props?: OpenReciboPreviewDialogProps) => void;
  openWhatsAppShowcaseDialog: (props?: OpenWhatsAppShowcaseDialogProps) => void;
  openShowcaseTransporteEscolarDialog: () => void;
  openOnboardingSuccessDialog: (props: OpenOnboardingSuccessDialogProps) => void;
  openAcquisitionChannelDialog: () => void;
  openReferAndEarnDialog: () => void;
  openExcluirContaDialog: () => void;
  closeExcluirContaDialog: () => void;
  openTermosUsoDialog: () => void;
  openPoliticaPrivacidadeDialog: () => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  openPersonalizarMenuDialog: () => void;
  closePersonalizarMenuDialog: () => void;

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
