import AlterarSenhaDialog from "@/components/dialogs/AlterarSenhaDialog";
import { ExcluirContaDialog } from "@/components/dialogs/ExcluirContaDialog";
import CobrancaDeleteDialog from "@/components/dialogs/CobrancaDeleteDialog";
import CobrancaDialog from "@/components/dialogs/CobrancaDialog";
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import AdminCreateUserDialog from "@/components/dialogs/AdminCreateUserDialog";
import AdminDispatchNotificationDialog from "@/components/dialogs/AdminDispatchNotificationDialog";
import AdminConfirmBroadcastDialog from "@/components/dialogs/AdminConfirmBroadcastDialog";
import AdminPassengerNotificationsDialog from "@/components/dialogs/AdminPassengerNotificationsDialog";
import AdminPassengerSendCobrancaDialog from "@/components/dialogs/AdminPassengerSendCobrancaDialog";
import AdminDriverCobrancaDemoDialog from "@/components/dialogs/AdminDriverCobrancaDemoDialog";
import AdminVencimentoDetalhesDialog from "@/components/dialogs/AdminVencimentoDetalhesDialog";
import AdminUserActivityHistoryDialog from "@/components/dialogs/AdminUserActivityHistoryDialog";
import ContractSetupDialog from "@/components/dialogs/ContractSetupDialog";
import EditarPixDialog from "@/components/dialogs/EditarPixDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import CadastrarEscolasDialog from "@/components/dialogs/CadastrarEscolasDialog";
import FirstChargeDialog from "@/components/dialogs/FirstChargeDialog";
import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import GerenciarCategoriasDialog from "@/components/dialogs/GerenciarCategoriasDialog";
import AcquisitionChannelDialog from "@/components/dialogs/AcquisitionChannelDialog";
import ReferAndEarnDialog from "@/components/dialogs/ReferAndEarnDialog";
import PersonalizarMenuDialog from "@/components/dialogs/PersonalizarMenuDialog";
import { TermosUsoDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";

import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";
import ComplementarPagamentoDialog from "@/components/dialogs/ComplementarPagamentoDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import ResponsavelFormDialog from "@/components/dialogs/ResponsavelFormDialog";

import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import RouteFormDialog from "@/components/dialogs/RouteFormDialog";
import PixPaymentDialog from "@/components/dialogs/PixPaymentDialog";
import { SaaSCheckoutDialog } from "@/components/dialogs/SaaSCheckoutDialog";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { AnnualReceiptDialog } from "@/components/dialogs/AnnualReceiptDialog";
import { QuickStartPassageiroDialog } from "@/components/dialogs/QuickStartPassageiroDialog";
import { PassageiroFinanceiroDialog } from "@/components/dialogs/PassageiroFinanceiroDialog";
import { PassageiroEscolaDialog } from "@/components/dialogs/PassageiroEscolaDialog";
import { PassageiroTransporteDialog } from "@/components/dialogs/PassageiroTransporteDialog";
import { RegistrarAusenciaDialog } from "@/components/dialogs/RegistrarAusenciaDialog";
import { RevisarSolicitacaoDialog } from "@/components/dialogs/RevisarSolicitacaoDialog";
import { GerarContratoValidadorDialog } from "@/components/dialogs/GerarContratoValidadorDialog";
import { ConfirmarGerarContratoDialog } from "@/components/dialogs/ConfirmarGerarContratoDialog";
import { ImportarContratoDialog } from "@/components/dialogs/ImportarContratoDialog";
import { DefinirResponsavelPrincipalDialog } from "@/components/dialogs/DefinirResponsavelPrincipalDialog";
import { AdminConfigureReferralDialog } from "@/components/dialogs/AdminConfigureReferralDialog";
import { VideoStoriesDialog } from "@/components/dialogs/VideoStoriesDialog";
import { WhatsAppCobrancaPreviewDialog } from "@/components/dialogs/WhatsAppCobrancaPreviewDialog";
import { WhatsAppContratoPreviewDialog } from "@/components/dialogs/WhatsAppContratoPreviewDialog";
import { ReciboPreviewDialog } from "@/components/dialogs/ReciboPreviewDialog";
import { WhatsAppShowcaseDialog } from "@/components/dialogs/WhatsAppShowcaseDialog";
import { ShowcaseTransporteEscolarDialog } from "@/components/dialogs/ShowcaseTransporteEscolarDialog";
import { OnboardingSuccessDialog } from "@/components/dialogs/OnboardingSuccessDialog";
import { ImageFullscreenDialog } from "@/components/dialogs/ImageFullscreenDialog";
import { ReajusteLoteDialog } from "@/components/dialogs/ReajusteLoteDialog";
import { EditarReservaDialog } from "@/components/dialogs/EditarReservaDialog";
import { ConfirmarViradaAnoDialog } from "@/components/dialogs/ConfirmarViradaAnoDialog";
import { ConfirmarDisparoWabaDialog } from "@/components/dialogs/ConfirmarDisparoWabaDialog";
import {
  OpenPixPaymentDialogProps,
  OpenSaaSCheckoutDialogProps,
  OpenReceiptDialogProps,
  OpenAnnualReceiptDialogProps,
  OpenQuickStartPassageiroProps,
  OpenPassageiroFinanceiroProps,
  OpenPassageiroEscolaProps,
  OpenPassageiroTransporteProps,
  OpenRegistrarAusenciaProps,
  OpenConfirmarGerarContratoDialogProps,
  OpenGerarContratoValidadorDialogProps,
  OpenImportarContratoDialogProps,
  OpenResponsavelFormProps,
  OpenDefinirResponsavelPrincipalProps,
  OpenAdminDispatchNotificationDialogProps,
  OpenAdminPassengerNotificationsDialogProps,
  OpenAdminPassengerSendCobrancaDialogProps,
  OpenAdminDriverCobrancaDemoDialogProps,
  OpenAdminVencimentoDetalhesDialogProps,
  OpenAdminConfigureReferralDialogProps,
  OpenAdminUserActivityHistoryDialogProps,
  OpenAdminConfirmBroadcastDialogProps,
  OpenImageFullscreenProps,
  OpenVideoStoriesDialogProps,
  OpenWhatsAppCobrancaPreviewDialogProps,
  OpenWhatsAppContratoPreviewDialogProps,
  OpenReciboPreviewDialogProps,
  OpenWhatsAppShowcaseDialogProps,
  OpenOnboardingSuccessDialogProps,
  OpenReajusteLoteDialogProps,
  OpenEditarReservaDialogProps,
  OpenConfirmarViradaAnoDialogProps,
  OpenConfirmarDisparoWabaDialogProps,
} from "./LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Capacitor } from "@capacitor/core";
import { openBrowserLink } from "@/utils/browser";
import { BASE_DOMAIN } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { supabase } from "@/integrations/supabase/client";
import { PassageiroFormModes } from "@/types/enums";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutContext,
  OpenCobrancaDeleteDialogProps,
  OpenCobrancaEditDialogProps,
  OpenCobrancaFormProps,
  OpenConfirmationDialogProps,
  OpenContractSetupDialogProps,
  OpenEscolaFormProps,
  OpenCadastrarEscolasProps,
  OpenFirstChargeDialogProps,
  OpenGastoFormProps,
  OpenManualPaymentDialogProps,
  OpenComplementarPagamentoDialogProps,
  OpenPassageiroFormProps,
  OpenRevisarSolicitacaoProps,
  OpenVeiculoFormProps,
  OpenRouteFormProps,
} from "./LayoutContext";

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
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

  const [cadastrarEscolasDialogState, setCadastrarEscolasDialogState] = useState<{
    open: boolean;
    props?: OpenCadastrarEscolasProps;
  }>({
    open: false,
  });

  // Route Form Dialog State
  const [routeFormDialogState, setRouteFormDialogState] = useState<{
    open: boolean;
    props?: OpenRouteFormProps;
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

  const [revisarSolicitacaoDialogState, setRevisarSolicitacaoDialogState] = useState<{
    open: boolean;
    props?: OpenRevisarSolicitacaoProps;
  }>({
    open: false,
  });

  const [quickStartPassageiroState, setQuickStartPassageiroState] = useState<{
    open: boolean;
    props?: OpenQuickStartPassageiroProps;
  }>({
    open: false,
  });

  const [passageiroFinanceiroDialogState, setPassageiroFinanceiroDialogState] = useState<{
    open: boolean;
    props?: OpenPassageiroFinanceiroProps;
  }>({
    open: false,
  });

  const [passageiroEscolaDialogState, setPassageiroEscolaDialogState] = useState<{
    open: boolean;
    props?: OpenPassageiroEscolaProps;
  }>({
    open: false,
  });

  const [passageiroTransporteDialogState, setPassageiroTransporteDialogState] = useState<{
    open: boolean;
    props?: OpenPassageiroTransporteProps;
  }>({
    open: false,
  });

  const [registrarAusenciaDialogState, setRegistrarAusenciaDialogState] = useState<{
    open: boolean;
    props?: OpenRegistrarAusenciaProps;
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

  // Gerenciar Categorias Dialog State
  const [gerenciarCategoriasDialogState, setGerenciarCategoriasDialogState] = useState<{
    open: boolean;
    props?: { usuarioId?: string };
  }>({
    open: false,
  });

  // Responsavel Form Dialog State
  const [responsavelFormDialogState, setResponsavelFormDialogState] = useState<{
    open: boolean;
    props?: OpenResponsavelFormProps;
  }>({
    open: false,
  });

  const [definirResponsavelPrincipalState, setDefinirResponsavelPrincipalState] = useState<{
    open: boolean;
    props?: OpenDefinirResponsavelPrincipalProps;
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

  const [complementarPagamentoDialogState, setComplementarPagamentoDialogState] = useState<{
    open: boolean;
    props?: OpenComplementarPagamentoDialogProps;
  }>({
    open: false,
  });

  const [receiptDialogState, setReceiptDialogState] = useState<{
    open: boolean;
    props?: OpenReceiptDialogProps;
  }>({
    open: false,
  });

  const [annualReceiptDialogState, setAnnualReceiptDialogState] = useState<{
    open: boolean;
    props?: OpenAnnualReceiptDialogProps;
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

  const [contractSetupDialogState, setContractSetupDialogState] = useState<{
    open: boolean;
    props?: OpenContractSetupDialogProps;
  }>({
    open: false,
  });

  const [pixPaymentDialogState, setPixPaymentDialogState] = useState<{
    open: boolean;
    props?: OpenPixPaymentDialogProps;
  }>({
    open: false,
  });

  const [saasCheckoutDialogState, setSaasCheckoutDialogState] = useState<{
    open: boolean;
    props?: OpenSaaSCheckoutDialogProps;
  }>({
    open: false,
  });

  const [confirmarGerarContratoDialogState, setConfirmarGerarContratoDialogState] = useState<{
    open: boolean;
    props?: OpenConfirmarGerarContratoDialogProps;
  }>({
    open: false,
  });

  const [gerarContratoValidadorDialogState, setGerarContratoValidadorDialogState] = useState<{
    open: boolean;
    props?: OpenGerarContratoValidadorDialogProps;
  }>({
    open: false,
  });

  const [importarContratoDialogState, setImportarContratoDialogState] = useState<{
    open: boolean;
    props?: OpenImportarContratoDialogProps;
  }>({
    open: false,
  });

  const [reajusteLoteDialogState, setReajusteLoteDialogState] = useState<{
    open: boolean;
    props?: OpenReajusteLoteDialogProps;
  }>({
    open: false,
  });

  const [editarReservaDialogState, setEditarReservaDialogState] = useState<{
    open: boolean;
    props?: OpenEditarReservaDialogProps;
  }>({
    open: false,
  });

  const [confirmarViradaAnoDialogState, setConfirmarViradaAnoDialogState] = useState<{
    open: boolean;
    props?: OpenConfirmarViradaAnoDialogProps;
  }>({
    open: false,
  });

  const [confirmarDisparoWabaDialogState, setConfirmarDisparoWabaDialogState] = useState<{
    open: boolean;
    props?: OpenConfirmarDisparoWabaDialogProps;
  }>({
    open: false,
  });

  const [alterarSenhaDialogOpen, setAlterarSenhaDialogOpen] = useState(false);
  const [editarPixDialogOpen, setEditarPixDialogOpen] = useState(false);
  const [acquisitionChannelDialogOpen, setAcquisitionChannelDialogOpen] = useState(false);
  const [referAndEarnDialogOpen, setReferAndEarnDialogOpen] = useState(false);
  const [personalizarMenuDialogOpen, setPersonalizarMenuDialogOpen] = useState(false);
  const [excluirContaDialogOpen, setExcluirContaDialogOpen] = useState(false);
  const [termosUsoDialogOpen, setTermosUsoDialogOpen] = useState(false);
  const [politicaPrivacidadeDialogOpen, setPoliticaPrivacidadeDialogOpen] = useState(false);
  const [adminCreateUserDialogState, setAdminCreateUserDialogState] = useState<{
    open: boolean;
    onSuccess?: (userId: string) => void;
  }>({ open: false });
  const [adminDispatchNotificationDialogState, setAdminDispatchNotificationDialogState] = useState<{
    open: boolean;
    props?: OpenAdminDispatchNotificationDialogProps;
  }>({ open: false });
  const [adminPassengerNotificationsDialogState, setAdminPassengerNotificationsDialogState] = useState<{
    open: boolean;
    props?: OpenAdminPassengerNotificationsDialogProps;
  }>({ open: false });
  const [adminPassengerSendCobrancaDialogState, setAdminPassengerSendCobrancaDialogState] = useState<{
    open: boolean;
    props?: OpenAdminPassengerSendCobrancaDialogProps;
  }>({ open: false });
  const [adminDriverCobrancaDemoDialogState, setAdminDriverCobrancaDemoDialogState] = useState<{
    open: boolean;
    props?: OpenAdminDriverCobrancaDemoDialogProps;
  }>({ open: false });
  const [adminVencimentoDetalhesDialogState, setAdminVencimentoDetalhesDialogState] = useState<{
    open: boolean;
    props?: OpenAdminVencimentoDetalhesDialogProps;
  }>({ open: false });
  const [adminConfigureReferralDialogState, setAdminConfigureReferralDialogState] = useState<{
    open: boolean;
    props?: OpenAdminConfigureReferralDialogProps;
  }>({ open: false });
  const [adminUserActivityHistoryDialogState, setAdminUserActivityHistoryDialogState] = useState<{
    open: boolean;
    props?: OpenAdminUserActivityHistoryDialogProps;
  }>({ open: false });
  const [adminConfirmBroadcastDialogState, setAdminConfirmBroadcastDialogState] = useState<{
    open: boolean;
    props?: OpenAdminConfirmBroadcastDialogProps;
  }>({ open: false });
  const [imageFullscreenDialogState, setImageFullscreenDialogState] = useState<{
    open: boolean;
    props?: OpenImageFullscreenProps;
  }>({ open: false });
  const [videoStoriesDialogState, setVideoStoriesDialogState] = useState<{
    open: boolean;
    props?: OpenVideoStoriesDialogProps;
  }>({ open: false });
  const [whatsAppCobrancaPreviewDialogState, setWhatsAppCobrancaPreviewDialogState] = useState<{
    open: boolean;
    props?: OpenWhatsAppCobrancaPreviewDialogProps;
  }>({ open: false });
  const [whatsAppContratoPreviewDialogState, setWhatsAppContratoPreviewDialogState] = useState<{
    open: boolean;
    props?: OpenWhatsAppContratoPreviewDialogProps;
  }>({ open: false });
  const [reciboPreviewDialogState, setReciboPreviewDialogState] = useState<{
    open: boolean;
    props?: OpenReciboPreviewDialogProps;
  }>({ open: false });
  const [whatsAppShowcaseDialogState, setWhatsAppShowcaseDialogState] = useState<{
    open: boolean;
    props?: OpenWhatsAppShowcaseDialogProps;
  }>({ open: false });
  const [onboardingSuccessDialogState, setOnboardingSuccessDialogState] = useState<{
    open: boolean;
    props?: OpenOnboardingSuccessDialogProps;
  }>({ open: false });
  const [showcaseTransporteEscolarOpen, setShowcaseTransporteEscolarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalLoading, setIsGlobalLoadingState] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState<string | undefined>();

  const usarContratos = profile?.config_contrato?.usar_contratos;

  const handleContractGuardOpen = useCallback(() => {
    setContractSetupDialogState({ open: true });
  }, []);

  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => {
    setConfirmationDialogState({
      open: true,
      props,
    });
  };

  const closeConfirmationDialog = () => {
    safeCloseDialog(() =>
      setConfirmationDialogState((prev) => ({ ...prev, open: false }))
    );
  };

  const openDefinirResponsavelPrincipalDialog = (props: OpenDefinirResponsavelPrincipalProps) => {
    setDefinirResponsavelPrincipalState({
      open: true,
      props,
    });
  };

  const closeDefinirResponsavelPrincipalDialog = () => {
    safeCloseDialog(() =>
      setDefinirResponsavelPrincipalState((prev) => ({ ...prev, open: false }))
    );
  };

  const openEscolaFormDialog = (props?: OpenEscolaFormProps) => {
    setEscolaFormDialogState({
      open: true,
      props,
    });
  };

  const openCadastrarEscolasDialog = (props?: OpenCadastrarEscolasProps) => {
    setCadastrarEscolasDialogState({
      open: true,
      props,
    });
  };

  const closeCadastrarEscolasDialog = () => {
    safeCloseDialog(() =>
      setCadastrarEscolasDialogState((prev) => ({ ...prev, open: false }))
    );
  };

  const openRouteFormDialog = (props: OpenRouteFormProps) => {
    setRouteFormDialogState({
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

  const openRevisarSolicitacaoDialog = (props: OpenRevisarSolicitacaoProps) => {
    setRevisarSolicitacaoDialogState({
      open: true,
      props,
    });
  };

  const closeRevisarSolicitacaoDialog = () => {
    safeCloseDialog(() =>
      setRevisarSolicitacaoDialogState((prev) => ({ ...prev, open: false }))
    );
  };

  const openQuickStartPassageiroDialog = (props?: OpenQuickStartPassageiroProps) => {
    setQuickStartPassageiroState({
      open: true,
      props,
    });
  };

  const openPassageiroFinanceiroDialog = (props: OpenPassageiroFinanceiroProps) => {
    setPassageiroFinanceiroDialogState({
      open: true,
      props,
    });
  };

  const closePassageiroFinanceiroDialog = () => {
    safeCloseDialog(() => setPassageiroFinanceiroDialogState({ open: false }));
  };

  const openPassageiroEscolaDialog = (props: OpenPassageiroEscolaProps) => {
    setPassageiroEscolaDialogState({
      open: true,
      props,
    });
  };

  const closePassageiroEscolaDialog = () => {
    safeCloseDialog(() => setPassageiroEscolaDialogState({ open: false }));
  };

  const openPassageiroTransporteDialog = (props: OpenPassageiroTransporteProps) => {
    setPassageiroTransporteDialogState({
      open: true,
      props,
    });
  };

  const closePassageiroTransporteDialog = () => {
    safeCloseDialog(() => setPassageiroTransporteDialogState({ open: false }));
  };

  const openRegistrarAusenciaDialog = (props?: OpenRegistrarAusenciaProps) => {
    setRegistrarAusenciaDialogState({
      open: true,
      props,
    });
  };

  const closeRegistrarAusenciaDialog = () => {
    safeCloseDialog(() => setRegistrarAusenciaDialogState({ open: false }));
  };

  const openGastoFormDialog = (props?: OpenGastoFormProps) => {
    setGastoFormDialogState({
      open: true,
      props,
    });
  };

  const openGerenciarCategoriasDialog = (props?: { usuarioId?: string }) => {
    setGerenciarCategoriasDialogState({
      open: true,
      props,
    });
  };

  const openResponsavelFormDialog = (props: OpenResponsavelFormProps) => {
    setResponsavelFormDialogState({
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
    safeCloseDialog(() =>
      setCobrancaDeleteDialogState((prev) => ({ ...prev, open: false }))
    );
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

  const openComplementarPagamentoDialog = (props: OpenComplementarPagamentoDialogProps) => {
    setComplementarPagamentoDialogState({
      open: true,
      props,
    });
  };

  const closeComplementarPagamentoDialog = () => {
    safeCloseDialog(() => {
      setComplementarPagamentoDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openReceiptDialog = (props: OpenReceiptDialogProps) => {
    setReceiptDialogState({
      open: true,
      props,
    });
  };

  const openAnnualReceiptDialog = (props: OpenAnnualReceiptDialogProps) => {
    setAnnualReceiptDialogState({
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

  const openContractSetupDialog = (props?: OpenContractSetupDialogProps) => {
    setContractSetupDialogState({ open: true, props });
  };

  const openPixPaymentDialog = (props: OpenPixPaymentDialogProps) => {
    setPixPaymentDialogState({ open: true, props });
  };

  const openSaaSCheckoutDialog = async (props: OpenSaaSCheckoutDialogProps) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const { access_token, refresh_token } = data.session;
          const checkoutUrl = `${BASE_DOMAIN}${ROUTES.PUBLIC.EXTERNAL_CHECKOUT_BRIDGE}?access_token=${access_token}&refresh_token=${refresh_token}&auto_open=true`;
          openBrowserLink(checkoutUrl);
          return;
        }
      } catch (err) {
        console.error("Erro ao gerar link de checkout externo:", err);
      }
    }
    setSaasCheckoutDialogState({ open: true, props });
  };

  const openAdminCreateUserDialog = (onSuccess?: (userId: string) => void) => {
    setAdminCreateUserDialogState({ open: true, onSuccess });
  };

  const openAdminDispatchNotificationDialog = (props: OpenAdminDispatchNotificationDialogProps) => {
    setAdminDispatchNotificationDialogState({ open: true, props });
  };

  const openAdminPassengerNotificationsDialog = (props: OpenAdminPassengerNotificationsDialogProps) => {
    setAdminPassengerNotificationsDialogState({ open: true, props });
  };

  const openAdminPassengerSendCobrancaDialog = (props: OpenAdminPassengerSendCobrancaDialogProps) => {
    setAdminPassengerSendCobrancaDialogState({ open: true, props });
  };

  const openAdminDriverCobrancaDemoDialog = (props: OpenAdminDriverCobrancaDemoDialogProps) => {
    setAdminDriverCobrancaDemoDialogState({ open: true, props });
  };

  const openAdminVencimentoDetalhesDialog = (props: OpenAdminVencimentoDetalhesDialogProps) => {
    setAdminVencimentoDetalhesDialogState({ open: true, props });
  };

  const openAdminConfigureReferralDialog = (props: OpenAdminConfigureReferralDialogProps) => {
    setAdminConfigureReferralDialogState({ open: true, props });
  };

  const openAdminUserActivityHistoryDialog = (props: OpenAdminUserActivityHistoryDialogProps) => {
    setAdminUserActivityHistoryDialogState({ open: true, props });
  };

  const openAdminConfirmBroadcastDialog = (props: OpenAdminConfirmBroadcastDialogProps) => {
    setAdminConfirmBroadcastDialogState({ open: true, props });
  };

  const closeAdminConfirmBroadcastDialog = () => {
    safeCloseDialog(() => setAdminConfirmBroadcastDialogState({ open: false }));
  };

  const openImageFullscreen = (props: OpenImageFullscreenProps) => {
    setImageFullscreenDialogState({ open: true, props });
  };

  const closeImageFullscreen = () => {
    safeCloseDialog(() => setImageFullscreenDialogState({ open: false }));
  };

  const openConfirmarGerarContratoDialog = (props: OpenConfirmarGerarContratoDialogProps) => {
    setConfirmarGerarContratoDialogState({ open: true, props });
  };

  const closeConfirmarGerarContratoDialog = () => {
    safeCloseDialog(() => {
      setConfirmarGerarContratoDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openGerarContratoValidadorDialog = (props: OpenGerarContratoValidadorDialogProps) => {
    setGerarContratoValidadorDialogState({ open: true, props });
  };

  const openImportarContratoDialog = (props?: OpenImportarContratoDialogProps) => {
    setImportarContratoDialogState({ open: true, props });
  };

  const openVideoStoriesDialog = (props: OpenVideoStoriesDialogProps) => {
    setVideoStoriesDialogState({ open: true, props });
  };

  const closeVideoStoriesDialog = () => {
    safeCloseDialog(() => {
      setVideoStoriesDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openWhatsAppCobrancaPreviewDialog = (props?: OpenWhatsAppCobrancaPreviewDialogProps) => {
    setWhatsAppCobrancaPreviewDialogState({ open: true, props });
  };

  const openWhatsAppContratoPreviewDialog = (props?: OpenWhatsAppContratoPreviewDialogProps) => {
    setWhatsAppContratoPreviewDialogState({ open: true, props });
  };

  const openReciboPreviewDialog = (props?: OpenReciboPreviewDialogProps) => {
    setReciboPreviewDialogState({ open: true, props });
  };

  const openWhatsAppShowcaseDialog = (props?: OpenWhatsAppShowcaseDialogProps) => {
    setWhatsAppShowcaseDialogState({ open: true, props });
  };

  const openOnboardingSuccessDialog = (props: OpenOnboardingSuccessDialogProps) => {
    setOnboardingSuccessDialogState({ open: true, props });
  };

  const openShowcaseTransporteEscolarDialog = () => {
    setShowcaseTransporteEscolarOpen(true);
  };

  const openReajusteLoteDialog = (props: OpenReajusteLoteDialogProps) => {
    setReajusteLoteDialogState({ open: true, props });
  };

  const closeReajusteLoteDialog = () => {
    safeCloseDialog(() => setReajusteLoteDialogState({ open: false }));
  };

  const openEditarReservaDialog = (props: OpenEditarReservaDialogProps) => {
    setEditarReservaDialogState({ open: true, props });
  };

  const closeEditarReservaDialog = () => {
    safeCloseDialog(() => setEditarReservaDialogState({ open: false }));
  };

  const openConfirmarViradaAnoDialog = (props: OpenConfirmarViradaAnoDialogProps) => {
    setConfirmarViradaAnoDialogState({ open: true, props });
  };

  const closeConfirmarViradaAnoDialog = () => {
    safeCloseDialog(() => setConfirmarViradaAnoDialogState({ open: false }));
  };

  const openConfirmarDisparoWabaDialog = (props: OpenConfirmarDisparoWabaDialogProps) => {
    setConfirmarDisparoWabaDialogState({ open: true, props });
  };

  const closeConfirmarDisparoWabaDialog = () => {
    safeCloseDialog(() => setConfirmarDisparoWabaDialogState({ open: false }));
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
        openDefinirResponsavelPrincipalDialog,
        closeDefinirResponsavelPrincipalDialog,
        openEscolaFormDialog,
        openCadastrarEscolasDialog,
        closeCadastrarEscolasDialog,
        openVeiculoFormDialog,
        openPassageiroFormDialog,
        openRevisarSolicitacaoDialog,
        closeRevisarSolicitacaoDialog,
        openRouteFormDialog,
        openQuickStartPassageiroDialog,
        openPassageiroFinanceiroDialog,
        closePassageiroFinanceiroDialog,
        openPassageiroEscolaDialog,
        closePassageiroEscolaDialog,
        openPassageiroTransporteDialog,
        closePassageiroTransporteDialog,
        openRegistrarAusenciaDialog,
        closeRegistrarAusenciaDialog,
        openGastoFormDialog,
        openGerenciarCategoriasDialog,
        openResponsavelFormDialog,
        openCobrancaDeleteDialog,
        closeCobrancaDeleteDialog,
        openCobrancaEditDialog,
        openManualPaymentDialog,
        openComplementarPagamentoDialog,
        closeComplementarPagamentoDialog,
        openReceiptDialog,
        openAnnualReceiptDialog,
        openCobrancaFormDialog,
        openFirstChargeDialog,
        openPixPaymentDialog,
        openSaaSCheckoutDialog,
        openAdminCreateUserDialog,
        openAdminDispatchNotificationDialog,
        openAdminPassengerNotificationsDialog,
        openAdminPassengerSendCobrancaDialog,
        openAdminDriverCobrancaDemoDialog,
        openAdminVencimentoDetalhesDialog,
        openAdminConfigureReferralDialog,
        openAdminUserActivityHistoryDialog,
        openAdminConfirmBroadcastDialog,
        closeAdminConfirmBroadcastDialog,
        openImageFullscreen,
        closeImageFullscreen,
        openConfirmarGerarContratoDialog,
        closeConfirmarGerarContratoDialog,
        openGerarContratoValidadorDialog,
        openImportarContratoDialog,
         openVideoStoriesDialog,
        closeVideoStoriesDialog,
        openReajusteLoteDialog,
        closeReajusteLoteDialog,
        openEditarReservaDialog,
        closeEditarReservaDialog,
        openConfirmarViradaAnoDialog,
        closeConfirmarViradaAnoDialog,
        openConfirmarDisparoWabaDialog,
        closeConfirmarDisparoWabaDialog,

        isFirstChargeDialogOpen: firstChargeDialogState.open,
        openContractSetupDialog,
        openAlterarSenhaDialog: () => setAlterarSenhaDialogOpen(true),
        openEditarPixDialog: () => setEditarPixDialogOpen(true),
        openWhatsAppCobrancaPreviewDialog,
        openWhatsAppContratoPreviewDialog,
        openReciboPreviewDialog,
        openWhatsAppShowcaseDialog,
        openShowcaseTransporteEscolarDialog,
        openOnboardingSuccessDialog,
        openAcquisitionChannelDialog: () => setAcquisitionChannelDialogOpen(true),
        openReferAndEarnDialog: () => setReferAndEarnDialogOpen(true),
        openPersonalizarMenuDialog: () => setPersonalizarMenuDialogOpen(true),
        closePersonalizarMenuDialog: () => safeCloseDialog(() => setPersonalizarMenuDialogOpen(false)),
        openExcluirContaDialog: () => setExcluirContaDialogOpen(true),
        closeExcluirContaDialog: () => safeCloseDialog(() => setExcluirContaDialogOpen(false)),
        openTermosUsoDialog: () => setTermosUsoDialogOpen(true),
        openPoliticaPrivacidadeDialog: () => setPoliticaPrivacidadeDialogOpen(true),
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isGlobalLoading,
        setIsGlobalLoading: (active: boolean, text?: string) => {
          setIsGlobalLoadingState(active);
          setGlobalLoadingText(text);
        },
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
          onConfirm={() => {
            if (confirmationDialogState.props?.onConfirm) {
              return confirmationDialogState.props.onConfirm();
            }
          }}
          confirmText={confirmationDialogState.props.confirmText}
          cancelText={confirmationDialogState.props.cancelText}
          variant={confirmationDialogState.props.variant}
          isLoading={confirmationDialogState.props.isLoading}
          onCancel={confirmationDialogState.props.onCancel}
          allowClose={confirmationDialogState.props.allowClose}
        />
      )}

      {definirResponsavelPrincipalState.open && definirResponsavelPrincipalState.props && (
        <DefinirResponsavelPrincipalDialog
          open={definirResponsavelPrincipalState.open}
          onClose={closeDefinirResponsavelPrincipalDialog}
          responsavelNome={definirResponsavelPrincipalState.props.responsavelNome}
          passageiroNome={definirResponsavelPrincipalState.props.passageiroNome}
          onConfirm={definirResponsavelPrincipalState.props.onConfirm}
        />
      )}

      {routeFormDialogState.open && (
        <RouteFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setRouteFormDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          onSuccess={(data) => {
            safeCloseDialog(() =>
              setRouteFormDialogState((prev) => ({ ...prev, open: false }))
            );
            routeFormDialogState.props?.onSuccess?.(data);
          }}
          editingRoute={routeFormDialogState.props?.editingRoute}
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
              safeCloseDialog(() =>
                setEscolaFormDialogState((prev) => ({ ...prev, open: false }))
              );
            }
            escolaFormDialogState.props?.onSuccess?.(escola, keepOpen);
          }}
          editingEscola={escolaFormDialogState.props?.editingEscola}
          profile={profile}
          allowBatchCreation={escolaFormDialogState.props?.allowBatchCreation}
        />
      )}

      {cadastrarEscolasDialogState.open && (
        <CadastrarEscolasDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setCadastrarEscolasDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          onSuccess={(primeiraEscola, todasEscolas) => {
            safeCloseDialog(() =>
              setCadastrarEscolasDialogState((prev) => ({ ...prev, open: false }))
            );
            cadastrarEscolasDialogState.props?.onSuccess?.(primeiraEscola, todasEscolas);
          }}
          profile={profile}
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
              safeCloseDialog(() =>
                setVeiculoFormDialogState((prev) => ({ ...prev, open: false }))
              );
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
            safeCloseDialog(() =>
              setPassageiroFormDialogState((prev) => ({ ...prev, open: false }))
            );
          }}
          onClose={() => {
            safeCloseDialog(() =>
              setPassageiroFormDialogState((prev) => ({ ...prev, open: false }))
            );
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

      {revisarSolicitacaoDialogState.open && (
        <RevisarSolicitacaoDialog
          isOpen={true}
          prePassageiro={revisarSolicitacaoDialogState.props?.prePassageiro || null}
          onSuccess={(passageiro) => {
            const innerOnSuccess = revisarSolicitacaoDialogState.props?.onSuccess;
            if (innerOnSuccess) {
              innerOnSuccess(passageiro);
            }
            safeCloseDialog(() =>
              setRevisarSolicitacaoDialogState((prev) => ({ ...prev, open: false }))
            );
          }}
          onClose={() => {
            safeCloseDialog(() =>
              setRevisarSolicitacaoDialogState((prev) => ({ ...prev, open: false }))
            );
          }}
        />
      )}

      {quickStartPassageiroState.open && (
        <QuickStartPassageiroDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setQuickStartPassageiroState({ open: false }))}
          onSuccess={quickStartPassageiroState.props?.onSuccess}
          isOnboarding={quickStartPassageiroState.props?.isOnboarding}
          usuarioId={profile?.id}
        />
      )}

      {passageiroFinanceiroDialogState.open && passageiroFinanceiroDialogState.props && (
        <PassageiroFinanceiroDialog
          isOpen={true}
          onClose={closePassageiroFinanceiroDialog}
          passageiro={passageiroFinanceiroDialogState.props.passageiro}
          onSuccess={passageiroFinanceiroDialogState.props.onSuccess}
        />
      )}

      {passageiroEscolaDialogState.open && passageiroEscolaDialogState.props && (
        <PassageiroEscolaDialog
          isOpen={true}
          onClose={closePassageiroEscolaDialog}
          passageiro={passageiroEscolaDialogState.props.passageiro}
          onSuccess={passageiroEscolaDialogState.props.onSuccess}
        />
      )}

      {passageiroTransporteDialogState.open && passageiroTransporteDialogState.props && (
        <PassageiroTransporteDialog
          isOpen={true}
          onClose={closePassageiroTransporteDialog}
          passageiro={passageiroTransporteDialogState.props.passageiro}
          onSuccess={passageiroTransporteDialogState.props.onSuccess}
        />
      )}

      {registrarAusenciaDialogState.open && (
        <RegistrarAusenciaDialog
          isOpen={true}
          onClose={closeRegistrarAusenciaDialog}
          lockedRotaId={registrarAusenciaDialogState.props?.lockedRotaId}
          lockedPassageiro={registrarAusenciaDialogState.props?.lockedPassageiro}
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
            safeCloseDialog(() =>
              setGastoFormDialogState((prev) => ({ ...prev, open: false }))
            );
            gastoFormDialogState.props?.onSuccess?.();
          }}
          gastoToEdit={gastoFormDialogState.props?.gastoToEdit}
          veiculos={gastoFormDialogState.props?.veiculos || []}
          usuarioId={gastoFormDialogState.props?.usuarioId || profile?.id}
        />
      )}

      {gerenciarCategoriasDialogState.open && (
        <GerenciarCategoriasDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setGerenciarCategoriasDialogState((prev) => ({ ...prev, open: false }))
            )
          }
          usuarioId={gerenciarCategoriasDialogState.props?.usuarioId || profile?.id}
        />
      )}

      {responsavelFormDialogState.open && responsavelFormDialogState.props && (
        <ResponsavelFormDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setResponsavelFormDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          passageiroId={responsavelFormDialogState.props.passageiroId}
          editingResponsavel={responsavelFormDialogState.props.editingResponsavel || null}
          isResponsavelPortal={responsavelFormDialogState.props.isResponsavelPortal}
          onSuccess={() => {
            safeCloseDialog(() =>
              setResponsavelFormDialogState((prev) => ({ ...prev, open: false }))
            );
            responsavelFormDialogState.props?.onSuccess?.();
          }}
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
          onCobrancaUpdated={() =>
            safeCloseDialog(() => {
              cobrancaEditDialogState.props?.onSuccess?.();
              setCobrancaEditDialogState((prev) => ({ ...prev, open: false }));
            })
          }
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
          onEdit={
            cobrancaDeleteDialogState.props?.onEdit
              ? () => {
                  cobrancaDeleteDialogState.props?.onEdit?.();
                  closeCobrancaDeleteDialog();
                }
              : undefined
          }
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
          observacao={manualPaymentDialogState.props.observacao}
          onPaymentRecorded={(updatedCobranca) => {
            manualPaymentDialogState.props?.onPaymentRecorded?.(updatedCobranca);
          }}
        />
      )}

      {complementarPagamentoDialogState.open && complementarPagamentoDialogState.props && (
        <ComplementarPagamentoDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() =>
              setComplementarPagamentoDialogState((prev) => ({ ...prev, open: false })),
            )
          }
          cobrancaId={complementarPagamentoDialogState.props.cobrancaId}
          passageiroNome={complementarPagamentoDialogState.props.passageiroNome}
          responsavelNome={complementarPagamentoDialogState.props.responsavelNome}
          valorOriginal={complementarPagamentoDialogState.props.valorOriginal}
          valorJaPago={complementarPagamentoDialogState.props.valorJaPago}
          dataVencimento={complementarPagamentoDialogState.props.dataVencimento}
          mes={complementarPagamentoDialogState.props.mes}
          ano={complementarPagamentoDialogState.props.ano}
          observacao={complementarPagamentoDialogState.props.observacao}
          onPaymentRecorded={(updatedCobranca, dataSent) => {
            complementarPagamentoDialogState.props?.onPaymentRecorded?.(updatedCobranca, dataSent);
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
          onCobrancaAdded={() =>
            safeCloseDialog(() => {
              cobrancaFormDialogState.props?.onSuccess?.();
              setCobrancaFormDialogState((prev) => ({ ...prev, open: false }));
            })
          }
          passageiroId={cobrancaFormDialogState.props.passageiroId}
          passageiroNome={cobrancaFormDialogState.props.passageiroNome}
          passageiroResponsavelNome={
            cobrancaFormDialogState.props.passageiroResponsavelNome
          }
          valorCobranca={cobrancaFormDialogState.props.valorCobranca}
          diaVencimento={cobrancaFormDialogState.props.diaVencimento}
          mes={cobrancaFormDialogState.props.mes}
          ano={cobrancaFormDialogState.props.ano}
          lockFoiPago={cobrancaFormDialogState.props.lockFoiPago}
          lockMesAno={cobrancaFormDialogState.props.lockMesAno}
          availableMonths={cobrancaFormDialogState.props.availableMonths}
        />
      )}

      {firstChargeDialogState.open && firstChargeDialogState.props && (
        <FirstChargeDialog
          isOpen={true}
          onClose={() =>
            safeCloseDialog(() => {
              setFirstChargeDialogState((prev) => ({ ...prev, open: false }));
            })
          }
          passageiro={firstChargeDialogState.props.passageiro}
          isFirstPassageiro={firstChargeDialogState.props.isFirstPassageiro}
          onSuccess={firstChargeDialogState.props.onSuccess}
        />
      )}

      {contractSetupDialogState.open && (
        <ContractSetupDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setContractSetupDialogState({ open: false }))}
          onSuccess={contractSetupDialogState.props?.onSuccess}
          ano={contractSetupDialogState.props?.ano}
        />
      )}

      {alterarSenhaDialogOpen && (
        <AlterarSenhaDialog
          isOpen={alterarSenhaDialogOpen}
          onClose={() => safeCloseDialog(() => setAlterarSenhaDialogOpen(false))}
        />
      )}

      {editarPixDialogOpen && (
        <EditarPixDialog
          isOpen={editarPixDialogOpen}
          onClose={() => safeCloseDialog(() => setEditarPixDialogOpen(false))}
        />
      )}

      {whatsAppCobrancaPreviewDialogState.open && (
        <WhatsAppCobrancaPreviewDialog
          isOpen={whatsAppCobrancaPreviewDialogState.open}
          onClose={() => safeCloseDialog(() => setWhatsAppCobrancaPreviewDialogState({ open: false }))}
          driverName={whatsAppCobrancaPreviewDialogState.props?.driverName}
          passageiroNome={whatsAppCobrancaPreviewDialogState.props?.passageiroNome}
          userChavePix={whatsAppCobrancaPreviewDialogState.props?.userChavePix}
          showPixSetupAction={whatsAppCobrancaPreviewDialogState.props?.showPixSetupAction}
        />
      )}

      {whatsAppContratoPreviewDialogState.open && (
        <WhatsAppContratoPreviewDialog
          isOpen={whatsAppContratoPreviewDialogState.open}
          onClose={() => safeCloseDialog(() => setWhatsAppContratoPreviewDialogState({ open: false }))}
          driverName={whatsAppContratoPreviewDialogState.props?.driverName}
          passageiroNome={whatsAppContratoPreviewDialogState.props?.passageiroNome}
        />
      )}

      {reciboPreviewDialogState.open && (
        <ReciboPreviewDialog
          isOpen={reciboPreviewDialogState.open}
          onClose={() => safeCloseDialog(() => setReciboPreviewDialogState({ open: false }))}
          driverName={reciboPreviewDialogState.props?.driverName}
          passageiroNome={reciboPreviewDialogState.props?.passageiroNome}
        />
      )}

      {whatsAppShowcaseDialogState.open && (
        <WhatsAppShowcaseDialog
          isOpen={whatsAppShowcaseDialogState.open}
          onClose={() => safeCloseDialog(() => setWhatsAppShowcaseDialogState({ open: false }))}
          initialTab={whatsAppShowcaseDialogState.props?.initialTab}
          driverName={whatsAppShowcaseDialogState.props?.driverName}
          passageiroNome={whatsAppShowcaseDialogState.props?.passageiroNome}
        />
      )}

      {showcaseTransporteEscolarOpen && (
        <ShowcaseTransporteEscolarDialog
          isOpen={showcaseTransporteEscolarOpen}
          onClose={() => safeCloseDialog(() => setShowcaseTransporteEscolarOpen(false))}
          onNavigateToRegister={() => navigate(ROUTES.PUBLIC.REGISTER, { state: { fromSplash: true } })}
        />
      )}

      {onboardingSuccessDialogState.open && onboardingSuccessDialogState.props && (
        <OnboardingSuccessDialog
          isOpen={onboardingSuccessDialogState.open}
          onClose={() => safeCloseDialog(() => setOnboardingSuccessDialogState({ open: false }))}
          onNavigateToPassageiro={onboardingSuccessDialogState.props.onNavigateToPassageiro}
          passageiroNome={onboardingSuccessDialogState.props.passageiroNome}
          onOpenShowcase={(tab) =>
            openWhatsAppShowcaseDialog({
              initialTab: tab,
              passageiroNome: onboardingSuccessDialogState.props?.passageiroNome,
            })
          }
          onOpenWhatsAppPreview={() =>
            openWhatsAppShowcaseDialog({
              initialTab: "cobranca",
              passageiroNome: onboardingSuccessDialogState.props?.passageiroNome,
            })
          }
          onOpenContratoPreview={() =>
            openWhatsAppShowcaseDialog({
              initialTab: "contrato",
              passageiroNome: onboardingSuccessDialogState.props?.passageiroNome,
            })
          }
          onOpenReciboPreview={() =>
            openWhatsAppShowcaseDialog({
              initialTab: "recibo",
              passageiroNome: onboardingSuccessDialogState.props?.passageiroNome,
            })
          }
        />
      )}

      {acquisitionChannelDialogOpen && (
        <AcquisitionChannelDialog
          isOpen={acquisitionChannelDialogOpen}
          onClose={() => safeCloseDialog(() => setAcquisitionChannelDialogOpen(false))}
        />
      )}

      {referAndEarnDialogOpen && (
        <ReferAndEarnDialog
          isOpen={referAndEarnDialogOpen}
          onClose={() => safeCloseDialog(() => setReferAndEarnDialogOpen(false))}
        />
      )}

      {personalizarMenuDialogOpen && (
        <PersonalizarMenuDialog
          isOpen={personalizarMenuDialogOpen}
          onClose={() => safeCloseDialog(() => setPersonalizarMenuDialogOpen(false))}
        />
      )}

      {excluirContaDialogOpen && (
        <ExcluirContaDialog
          open={excluirContaDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              safeCloseDialog(() => setExcluirContaDialogOpen(false));
            } else {
              setExcluirContaDialogOpen(true);
            }
          }}
        />
      )}

      {termosUsoDialogOpen && (
        <TermosUsoDialog
          open={termosUsoDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              safeCloseDialog(() => setTermosUsoDialogOpen(false));
            } else {
              setTermosUsoDialogOpen(true);
            }
          }}
        />
      )}

      {politicaPrivacidadeDialogOpen && (
        <PoliticaPrivacidadeDialog
          open={politicaPrivacidadeDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              safeCloseDialog(() => setPoliticaPrivacidadeDialogOpen(false));
            } else {
              setPoliticaPrivacidadeDialogOpen(true);
            }
          }}
        />
      )}

      {pixPaymentDialogState.open && pixPaymentDialogState.props && (
        <PixPaymentDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setPixPaymentDialogState({ open: false }))}
          {...pixPaymentDialogState.props}
        />
      )}

      {saasCheckoutDialogState.open && saasCheckoutDialogState.props && (
        <SaaSCheckoutDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setSaasCheckoutDialogState({ open: false }))}
          plans={saasCheckoutDialogState.props.plans}
          initialPlanId={saasCheckoutDialogState.props.initialPlanId}
          onSuccess={saasCheckoutDialogState.props.onSuccess}
          forcedPeriod={saasCheckoutDialogState.props.forcedPeriod}
        />
      )}

      {receiptDialogState.open && receiptDialogState.props && (
        <ReceiptDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setReceiptDialogState({ open: false }))}
          receiptUrl={receiptDialogState.props.receiptUrl}
          cobrancaDescricao={receiptDialogState.props.cobrancaDescricao}
          cobrancaId={receiptDialogState.props.cobrancaId}
          mes={receiptDialogState.props.mes}
          ano={receiptDialogState.props.ano}
          passageiroId={receiptDialogState.props.passageiroId}
          nomePassageiro={receiptDialogState.props.nomePassageiro}
          nomeResponsavel={receiptDialogState.props.nomeResponsavel}
          generoPassageiro={receiptDialogState.props.generoPassageiro}
        />
      )}

      {annualReceiptDialogState.open && annualReceiptDialogState.props && (
        <AnnualReceiptDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setAnnualReceiptDialogState({ open: false }))}
          receiptUrl={annualReceiptDialogState.props.receiptUrl}
          ano={annualReceiptDialogState.props.ano}
          alunoNome={annualReceiptDialogState.props.alunoNome}
          passageiroId={annualReceiptDialogState.props.passageiroId}
        />
      )}

      {adminCreateUserDialogState.open && (
        <AdminCreateUserDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setAdminCreateUserDialogState({ open: false }))}
          onSuccess={adminCreateUserDialogState.onSuccess}
        />
      )}

      {adminDispatchNotificationDialogState.open && adminDispatchNotificationDialogState.props && (
        <AdminDispatchNotificationDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setAdminDispatchNotificationDialogState({ open: false }))}
          userId={adminDispatchNotificationDialogState.props.userId}
          userName={adminDispatchNotificationDialogState.props.userName}
          userPhone={adminDispatchNotificationDialogState.props.userPhone}
          userEmail={adminDispatchNotificationDialogState.props.userEmail}
        />
      )}

      {adminPassengerNotificationsDialogState.open && adminPassengerNotificationsDialogState.props && (
        <AdminPassengerNotificationsDialog
          open={true}
          onClose={() => safeCloseDialog(() => setAdminPassengerNotificationsDialogState({ open: false }))}
          passageiroId={adminPassengerNotificationsDialogState.props.passageiroId}
          passageiroNome={adminPassengerNotificationsDialogState.props.passageiroNome}
        />
      )}

      {adminPassengerSendCobrancaDialogState.open && adminPassengerSendCobrancaDialogState.props && (
        <AdminPassengerSendCobrancaDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setAdminPassengerSendCobrancaDialogState({ open: false }))}
          userId={adminPassengerSendCobrancaDialogState.props.userId}
          passageiro={adminPassengerSendCobrancaDialogState.props.passageiro}
          motoristaNome={adminPassengerSendCobrancaDialogState.props.motoristaNome}
        />
      )}

      {adminDriverCobrancaDemoDialogState.open && adminDriverCobrancaDemoDialogState.props && (
        <AdminDriverCobrancaDemoDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setAdminDriverCobrancaDemoDialogState({ open: false }))}
          userId={adminDriverCobrancaDemoDialogState.props.userId}
          userName={adminDriverCobrancaDemoDialogState.props.userName}
          userPhone={adminDriverCobrancaDemoDialogState.props.userPhone}
          userApelido={adminDriverCobrancaDemoDialogState.props.userApelido}
          userChavePix={adminDriverCobrancaDemoDialogState.props.userChavePix}
          userTipoChavePix={adminDriverCobrancaDemoDialogState.props.userTipoChavePix}
        />
      )}

      {adminVencimentoDetalhesDialogState.open && adminVencimentoDetalhesDialogState.props && (
        <AdminVencimentoDetalhesDialog
          open={true}
          onClose={() => safeCloseDialog(() => setAdminVencimentoDetalhesDialogState({ open: false }))}
          dia={adminVencimentoDetalhesDialogState.props.dia}
          mes={adminVencimentoDetalhesDialogState.props.mes}
          ano={adminVencimentoDetalhesDialogState.props.ano}
        />
      )}

      {adminUserActivityHistoryDialogState.open && adminUserActivityHistoryDialogState.props && (
        <AdminUserActivityHistoryDialog
          open={true}
          onClose={() => safeCloseDialog(() => setAdminUserActivityHistoryDialogState({ open: false }))}
          userId={adminUserActivityHistoryDialogState.props.userId}
          userName={adminUserActivityHistoryDialogState.props.userName}
          userPhone={adminUserActivityHistoryDialogState.props.userPhone}
          dataInicio={adminUserActivityHistoryDialogState.props.dataInicio}
          dataFim={adminUserActivityHistoryDialogState.props.dataFim}
        />
      )}

      {adminConfigureReferralDialogState.open && adminConfigureReferralDialogState.props && (
        <AdminConfigureReferralDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setAdminConfigureReferralDialogState({ open: false }))}
          userId={adminConfigureReferralDialogState.props.userId}
          userName={adminConfigureReferralDialogState.props.userName}
          currentIndicadorId={adminConfigureReferralDialogState.props.currentIndicadorId}
          currentIndicadorNome={adminConfigureReferralDialogState.props.currentIndicadorNome}
          onSuccess={adminConfigureReferralDialogState.props.onSuccess}
        />
      )}

      {adminConfirmBroadcastDialogState.open && adminConfirmBroadcastDialogState.props && (
        <AdminConfirmBroadcastDialog
          isOpen={true}
          onClose={closeAdminConfirmBroadcastDialog}
          publicoDescricao={adminConfirmBroadcastDialogState.props.publicoDescricao}
          totalEligivel={adminConfirmBroadcastDialogState.props.totalEligivel}
          totalComPush={adminConfirmBroadcastDialogState.props.totalComPush}
          selectedActionConfig={adminConfirmBroadcastDialogState.props.selectedActionConfig}
          notificationTitle={adminConfirmBroadcastDialogState.props.notificationTitle}
          notificationMessage={adminConfirmBroadcastDialogState.props.notificationMessage}
          onConfirm={adminConfirmBroadcastDialogState.props.onConfirm}
          isSubmitting={adminConfirmBroadcastDialogState.props.isSubmitting}
        />
      )}

      {imageFullscreenDialogState.open && imageFullscreenDialogState.props && (
        <ImageFullscreenDialog
          isOpen={true}
          onClose={closeImageFullscreen}
          imageUrl={imageFullscreenDialogState.props.imageUrl}
          alt={imageFullscreenDialogState.props.alt}
        />
      )}

      {confirmarGerarContratoDialogState.open && confirmarGerarContratoDialogState.props && (
        <ConfirmarGerarContratoDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              closeConfirmarGerarContratoDialog();
            }
          }}
          passageiro={confirmarGerarContratoDialogState.props.passageiro}
          valorMensal={confirmarGerarContratoDialogState.props.valorMensal}
          diaVencimento={confirmarGerarContratoDialogState.props.diaVencimento}
          dataInicio={confirmarGerarContratoDialogState.props.dataInicio}
          dataFim={confirmarGerarContratoDialogState.props.dataFim}
          isSubstituicao={confirmarGerarContratoDialogState.props.isSubstituicao}
          contratoIdParaSubstituir={confirmarGerarContratoDialogState.props.contratoIdParaSubstituir}
          onSuccess={confirmarGerarContratoDialogState.props.onSuccess}
        />
      )}

      {gerarContratoValidadorDialogState.open && gerarContratoValidadorDialogState.props && (
        <GerarContratoValidadorDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setGerarContratoValidadorDialogState({ open: false }))}
          passageiroId={gerarContratoValidadorDialogState.props.passageiroId}
          initialPassageiro={gerarContratoValidadorDialogState.props.initialPassageiro}
          onSuccess={gerarContratoValidadorDialogState.props.onSuccess}
        />
      )}

      {importarContratoDialogState.open && (
        <ImportarContratoDialog
          isOpen={true}
          onClose={() => safeCloseDialog(() => setImportarContratoDialogState({ open: false }))}
          passageiroId={importarContratoDialogState.props?.passageiroId}
          passageiro={importarContratoDialogState.props?.passageiro}
          onSuccess={importarContratoDialogState.props?.onSuccess}
        />
      )}

      {videoStoriesDialogState.open && videoStoriesDialogState.props && (
        <VideoStoriesDialog
          open={videoStoriesDialogState.open}
          onOpenChange={(open) => {
            if (!open) {
              closeVideoStoriesDialog();
            } else {
              setVideoStoriesDialogState((prev) => ({ ...prev, open }));
            }
          }}
          {...videoStoriesDialogState.props}
        />
      )}

      {reajusteLoteDialogState.open && reajusteLoteDialogState.props && (
        <ReajusteLoteDialog
          isOpen={true}
          onClose={closeReajusteLoteDialog}
          anoDestino={reajusteLoteDialogState.props.anoDestino}
        />
      )}

      {editarReservaDialogState.open && editarReservaDialogState.props && (
        <EditarReservaDialog
          isOpen={true}
          onClose={closeEditarReservaDialog}
          passageiro={editarReservaDialogState.props.passageiro}
          anoDestino={editarReservaDialogState.props.anoDestino}
          onSuccess={editarReservaDialogState.props.onSuccess}
        />
      )}

      {confirmarViradaAnoDialogState.open && confirmarViradaAnoDialogState.props && (
        <ConfirmarViradaAnoDialog
          isOpen={true}
          onClose={closeConfirmarViradaAnoDialog}
          anoDestino={confirmarViradaAnoDialogState.props.anoDestino}
          kpis={confirmarViradaAnoDialogState.props.kpis}
          onSuccess={confirmarViradaAnoDialogState.props.onSuccess}
          onRevisarPendentes={confirmarViradaAnoDialogState.props.onRevisarPendentes}
        />
      )}

      {confirmarDisparoWabaDialogState.open && confirmarDisparoWabaDialogState.props && (
        <ConfirmarDisparoWabaDialog
          isOpen={true}
          onClose={closeConfirmarDisparoWabaDialog}
          passageiros={confirmarDisparoWabaDialogState.props.passageiros}
          anoDestino={confirmarDisparoWabaDialogState.props.anoDestino}
          onSuccess={confirmarDisparoWabaDialogState.props.onSuccess}
        />
      )}

      {isGlobalLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-4 max-w-xs mx-4 text-center border border-slate-100 animate-in zoom-in-95 duration-200">
            <Loader2 className="w-10 h-10 animate-spin text-[#1a3a5c]" />
            <p className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              {globalLoadingText || "Salvando..."}
            </p>
          </div>
        </div>
      )}

    </LayoutContext.Provider>
  );
};
