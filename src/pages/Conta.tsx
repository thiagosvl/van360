import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/config/permissions";
import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import { formatShortName } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileAvatarUpload } from "@/components/features/configuracoes/ProfileAvatarUpload";
import { NotificacoesPaisTab } from "@/components/features/configuracoes/NotificacoesPaisTab";
import { MinhasNotificacoesTab } from "@/components/features/configuracoes/MinhasNotificacoesTab";
import { RastreamentoTab } from "@/components/features/configuracoes/RastreamentoTab";
import { PerfilTab } from "@/components/features/configuracoes/PerfilTab";
import { PagamentosTab } from "@/components/features/configuracoes/PagamentosTab";
import { PreferenciasTab } from "@/components/features/configuracoes/PreferenciasTab";
import { AjudaTab } from "@/components/features/configuracoes/AjudaTab";
import { SegurancaBiometriaTab } from "@/components/features/configuracoes/SegurancaBiometriaTab";
import { WhatsAppSupportButton } from "@/components/ui/WhatsAppSupportButton";
import { useConfiguracoes } from "@/hooks";
import { ENABLE_LIVE_TRACKING } from "@/constants/tracking";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { isNativeIos } from "@/utils/detectPlatform";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Fingerprint,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  Navigation,
  Radio,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  User as UserIcon,
} from "lucide-react";

export const Conta = memo(function Conta() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const navigate = useNavigate();
  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile, refreshProfile } = useProfile(user?.id);
  const { configuracoes } = useConfiguracoes();
  const { can, isSubConta } = usePermissions();
  const { isBlocked: isSubscriptionBlocked } = useSubscriptionAccess(user?.id);

  const {
    openAlterarSenhaDialog,
    openConfirmationDialog,
    openTermosUsoDialog,
    openPoliticaPrivacidadeDialog,
    setIsGlobalLoading,
    setPageTitle,
  } = useLayout();

  useEffect(() => {
    if (!tabParam) {
      setPageTitle("Conta");
      return;
    }

    const tabTitles: Record<string, string> = {
      perfil: isSubConta ? "Dados Cadastrais" : "Dados Cadastrais",
      cobrancas: "Cobranças & Pix",
      pagamentos: "Cobranças & Pix",
      avisos_rota: "Avisos de Rota aos Pais",
      notificacoes_pais: "Avisos de Rota aos Pais",
      notificacoes: "Avisos de Rota aos Pais",
      minhas_notificacoes: "Minhas Notificações",
      rastreamento: "Rastreamento & GPS",
      seguranca: "Bloqueio de Tela",
      preferencias: "Preferências",
      ajuda: "Ajuda / Suporte",
    };

    setPageTitle(tabTitles[tabParam] || "Conta");
  }, [tabParam, isSubConta, setPageTitle]);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("1.0.6");

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      void CapacitorApp.getInfo().then((info) => {
        if (info.version) {
          setAppVersion(info.version);
        }
      });
    }
  }, []);

  const displayName = profile?.apelido || formatShortName(profile?.nome, true);

  const userInitials = useMemo(() => {
    if (!profile?.nome) return "U";
    const nameParts = profile.nome.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  }, [profile?.nome]);

  const handleSelectTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleSelectFleetTab = (tab: string) => {
    if (isSubscriptionBlocked) {
      toast.warning("Acesso suspenso. Reative seu plano para configurar as preferências da frota.");
      return;
    }
    handleSelectTab(tab);
  };

  const handleGoBack = () => {
    setSearchParams({});
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [tabParam]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setIsGlobalLoading(true, "Encerrando sessão...");

    try {
      try {
        await apiClient.post("/auth/logout");
      } catch {
        // Fallback silencioso para prosseguir com o logout local
      }

      await sessionManager.signOut();
      window.location.href = ROUTES.PUBLIC.LOGIN;
    } catch {
      clearAppSession();
      window.location.href = ROUTES.PUBLIC.LOGIN;
    }
  };

  const handleConfirmSignOut = () => {
    openConfirmationDialog({
      title: "Deseja sair da conta?",
      description: "Você será desconectado deste dispositivo e precisará entrar novamente.",
      confirmText: "Sim, sair",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await handleSignOut();
      },
    });
  };

  const renderCurrentView = () => {
    if (
      isSubscriptionBlocked &&
      (tabParam === "avisos_rota" ||
        tabParam === "notificacoes_pais" ||
        tabParam === "notificacoes" ||
        tabParam === "rastreamento" ||
        tabParam === "cobrancas" ||
        tabParam === "pagamentos")
    ) {
      return (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-8 text-center space-y-4 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <Lock className="w-10 h-10 text-[#737373] mx-auto" />
          <h2 className="text-lg font-semibold text-[#0a0a0a] tracking-tight">Acesso Suspenso</h2>
          <p className="text-sm text-[#737373] max-w-md mx-auto">
            Esta funcionalidade exige uma assinatura ativa. Regularize seu plano para acessar estas configurações.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION)}
            className="px-6 py-2.5 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            Ver Assinatura
          </button>
        </div>
      );
    }

    if (
      (tabParam === "avisos_rota" || tabParam === "notificacoes_pais" || tabParam === "notificacoes") &&
      !isSubConta
    ) {
      return <NotificacoesPaisTab />;
    }
    if (tabParam === "minhas_notificacoes") {
      return <MinhasNotificacoesTab />;
    }
    if (tabParam === "rastreamento" && !isSubConta && ENABLE_LIVE_TRACKING) {
      return <RastreamentoTab />;
    }
    if (tabParam === "perfil") {
      return <PerfilTab />;
    }
    if ((tabParam === "cobrancas" || tabParam === "pagamentos") && !isSubConta) {
      return <PagamentosTab />;
    }
    if (tabParam === "ajuda") {
      return <AjudaTab />;
    }
    if (tabParam === "seguranca") {
      return <SegurancaBiometriaTab />;
    }
    if (tabParam === "preferencias") {
      return <PreferenciasTab />;
    }

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex items-center gap-4">
          <ProfileAvatarUpload
            userId={profile?.id}
            logoUrl={profile?.logo_url}
            displayName={displayName}
            userInitials={userInitials}
            isLoading={isLoadingProfile}
            canEdit={!isSubConta && !!profile?.id}
            onLogoUpdated={refreshProfile}
          />

          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">
              Bem-vindo(a),
            </p>
            {isLoadingProfile ? (
              <Skeleton className="h-6 w-40 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <h1 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight truncate">
                {displayName}
              </h1>
            )}
          </div>
        </div>

        <WhatsAppSupportButton
          variant="clean"
          title="Falar com Suporte"
          subtitle="Atendimento rápido para tirar dúvidas sobre o app"
          message="Olá, preciso de suporte com o Van360"
        />

        <div className="space-y-2">
          <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
            Conta e acesso
          </h2>
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <button
              type="button"
              onClick={() => handleSelectTab("perfil")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    {isSubConta ? "Dados Cadastrais" : "Dados Cadastrais e Logotipo"}
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    {isSubConta
                      ? "Atualize seus dados pessoais e informações de contato"
                      : "Atualize seus dados pessoais, logotipo da van e informações de contato"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {can(PERMISSIONS.ASSINATURA_GERENCIAR) && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                      Assinatura
                    </h3>
                    <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                      Gerencie seu plano, pagamentos e benefícios Van360
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
            Segurança
          </h2>
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <button
              type="button"
              onClick={openAlterarSenhaDialog}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    Alterar Senha
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    Altere sua senha de acesso para manter sua conta protegida
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {Capacitor.isNativePlatform() && (
              <button
                type="button"
                onClick={() => handleSelectTab("seguranca")}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                      Bloqueio de Tela
                    </h3>
                    <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                      {isNativeIos()
                        ? "Proteja o app com Face ID, Touch ID ou código"
                        : "Proteja o app com digital ou senha do aparelho"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            )}
          </div>
        </div>

        {!isSubConta && (
          <div className="space-y-2">
            <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
              Rotas e Itinerários
            </h2>
            <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
              <button
                type="button"
                onClick={() => handleSelectFleetTab("avisos_rota")}
                className={cn(
                  "w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors group cursor-pointer",
                  isSubscriptionBlocked
                    ? "opacity-50 hover:bg-[#fafafa]/50"
                    : "hover:bg-[#fafafa]"
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={cn(
                      "h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] transition-all duration-200",
                      !isSubscriptionBlocked && "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                    )}
                  >
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                      Avisos de Rota aos Pais
                    </h3>
                    <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                      Notificações de trajeto, van a caminho e paradas aos responsáveis
                    </p>
                  </div>
                </div>
                {isSubscriptionBlocked ? (
                  <Lock className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                )}
              </button>

              {ENABLE_LIVE_TRACKING && (
                <button
                  type="button"
                  onClick={() => handleSelectFleetTab("rastreamento")}
                  className={cn(
                    "w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors group cursor-pointer",
                    isSubscriptionBlocked
                      ? "opacity-50 hover:bg-[#fafafa]/50"
                      : "hover:bg-[#fafafa]"
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] transition-all duration-200",
                        !isSubscriptionBlocked && "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                      )}
                    >
                      <Radio className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                        Rastreamento & GPS
                      </h3>
                      <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                        Visibilidade da van no mapa ao vivo e modos de rastreamento para os pais
                      </p>
                    </div>
                  </div>
                  {isSubscriptionBlocked ? (
                    <Lock className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {!isSubConta && (
          <div className="space-y-2">
            <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
              Cobranças e pagamentos
            </h2>
            <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
              <button
                type="button"
                onClick={() => handleSelectFleetTab("cobrancas")}
                className={cn(
                  "w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors group cursor-pointer",
                  isSubscriptionBlocked
                    ? "opacity-50 hover:bg-[#fafafa]/50"
                    : "hover:bg-[#fafafa]"
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={cn(
                      "h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] transition-all duration-200",
                      !isSubscriptionBlocked && "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                    )}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                      Cobranças & Pix
                    </h3>
                    <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                      Lembretes aos pais, chave Pix, baixa automática, repasse e recibos
                    </p>
                  </div>
                </div>
                {isSubscriptionBlocked ? (
                  <Lock className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
            Notificações
          </h2>
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <button
              type="button"
              onClick={() => handleSelectTab("minhas_notificacoes")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    Minhas Notificações
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    {isSubConta
                      ? "Lembretes de aniversariantes e avisos operacionais no seu celular"
                      : "Lembretes de parcelas a conferir, aniversariantes e avisos no seu celular"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
            Preferências do app
          </h2>
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <button
              type="button"
              onClick={() => handleSelectTab("preferencias")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    Preferências do Aplicativo
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    Exibição de nomes, formato de listagens e ajustes gerais do app
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
            Informações legais
          </h2>
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <button
              type="button"
              onClick={openTermosUsoDialog}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    Termos de Uso
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    Condições gerais de contratação e utilização do serviço
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            <button
              type="button"
              onClick={openPoliticaPrivacidadeDialog}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    Política de Privacidade
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    Como tratamos e protegemos seus dados pessoais segundo a LGPD
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1">
            Suporte e sessão
          </h2>
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] divide-y divide-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <button
              type="button"
              onClick={() => handleSelectTab("ajuda")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                    Ajuda / Suporte
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    Dúvidas frequentes, guias rápidos e canal de atendimento
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            <button
              type="button"
              onClick={handleConfirmSignOut}
              disabled={isSigningOut}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#fafafa] text-[#e7000b] flex items-center justify-center shrink-0 border border-[#e5e5e5] group-hover:bg-[#e7000b] group-hover:text-white transition-all duration-200">
                  {isSigningOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-[#e7000b] tracking-tight">
                    {isSigningOut ? "Saindo da conta..." : "Sair da Conta"}
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                    Encerrar a sessão atual neste dispositivo
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#e7000b]/50 group-hover:text-[#e7000b] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

        <div className="text-center pt-2 pb-4 space-y-1">
          <p className="text-xs font-medium text-[#737373]">
            Van360 • Todos os direitos reservados
          </p>
          {appVersion && (
            <p className="text-[11px] font-medium text-[#737373]">
              Versão {appVersion}
            </p>
          )}
        </div>
      </div>
    );
  };

  const isSubPage = Boolean(
    tabParam &&
    [
      "avisos_rota",
      "notificacoes_pais",
      "notificacoes",
      "cobrancas",
      "pagamentos",
      "minhas_notificacoes",
      "rastreamento",
      "perfil",
      "ajuda",
      "seguranca",
      "preferencias",
    ].includes(tabParam)
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-5 pb-24">
      {isSubPage && (
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors group w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#737373] group-hover:text-[#0a0a0a]" />
          Voltar para Conta
        </button>
      )}

      {renderCurrentView()}
    </div>
  );
});

export default Conta;
