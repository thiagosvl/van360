import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { usePermissions } from "@/hooks/business/usePermissions";
import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import { formatFirstName, formatUserRoleLabel } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificacoesPaisTab } from "@/components/features/configuracoes/NotificacoesPaisTab";
import { MinhasNotificacoesTab } from "@/components/features/configuracoes/MinhasNotificacoesTab";
import { RastreamentoTab } from "@/components/features/configuracoes/RastreamentoTab";
import { PerfilTab } from "@/components/features/configuracoes/PerfilTab";
import { PagamentosTab } from "@/components/features/configuracoes/PagamentosTab";
import { AjudaTab } from "@/components/features/configuracoes/AjudaTab";
import { ENABLE_LIVE_TRACKING } from "@/constants/tracking";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  Radio,
  Rocket,
  Smartphone,
  User as UserIcon,
} from "lucide-react";

export const Conta = memo(function Conta() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const navigate = useNavigate();
  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);
  const { can, isSubConta } = usePermissions();
  const {
    openAlterarSenhaDialog,
    openConfirmationDialog,
    setIsGlobalLoading,
  } = useLayout();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = profile?.apelido || formatFirstName(profile?.nome) || "Usuário";
  const roleLabel = formatUserRoleLabel(profile?.tipo);

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
    if ((tabParam === "notificacoes_pais" || tabParam === "notificacoes") && !isSubConta) {
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
    if (tabParam === "pagamentos" && !isSubConta) {
      return <PagamentosTab />;
    }
    if (tabParam === "ajuda") {
      return <AjudaTab />;
    }

    return (
      <div className="space-y-6">
        {/* Hero Card com Dados do Usuário */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs flex items-center gap-4">
          <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-slate-100 border border-slate-200 text-[#1a3a5c] flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-xs select-none">
            {isLoadingProfile ? (
              <Skeleton className="h-full w-full rounded-full" />
            ) : profile?.foto_url ? (
              <img
                src={profile.foto_url}
                alt={displayName}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Bem-vindo (a),
            </p>
            {isLoadingProfile ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {displayName}
              </h1>
            )}
            <div className="pt-0.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Grupo 1: Conta e acesso */}
        <div className="space-y-2">
          <h2 className="text-xs sm:text-[13px] font-bold text-slate-500 tracking-tight px-1">
            Conta e acesso
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {/* Opção 1: Meus dados */}
            <button
              type="button"
              onClick={() => handleSelectTab("perfil")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                    Meus dados
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Seus dados cadastrais e informações de contato
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Opção 2: Alterar Senha */}
            <button
              type="button"
              onClick={openAlterarSenhaDialog}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                    Alterar Senha
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Altere sua senha de acesso para manter sua conta protegida
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Opção 3: Minhas Notificações (Alertas no celular do motorista) */}
            <button
              type="button"
              onClick={() => handleSelectTab("minhas_notificacoes")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                    Minhas Notificações
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Lembretes de parcelas a conferir, aniversariantes e avisos no seu celular
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Opção 4: Assinatura do App (Gestor) */}
            {can("assinatura.gerenciar") && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                      Assinatura do App
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Gerencie seu plano, pagamentos e benefícios Van360
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Grupo 2: Preferências da van */}
        {!isSubConta && (
          <div className="space-y-2">
            <h2 className="text-xs sm:text-[13px] font-bold text-slate-500 tracking-tight px-1">
              Preferências da van
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
              {/* Opção 1: Notificações aos Pais */}
              <button
                type="button"
                onClick={() => handleSelectTab("notificacoes_pais")}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                      Notificações aos Pais
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Lembretes automáticos de parcelas e avisos de rota aos responsáveis
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Opção 2: Rastreamento & GPS */}
              {ENABLE_LIVE_TRACKING && (
                <button
                  type="button"
                  onClick={() => handleSelectTab("rastreamento")}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                        Rastreamento & GPS
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Visibilidade da van no mapa ao vivo e modos de rastreamento para os pais
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              )}

              {/* Opção 3: Pagamentos & PIX */}
              <button
                type="button"
                onClick={() => handleSelectTab("pagamentos")}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                      Pagamentos & PIX
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Chave PIX de recebimento e regras de multa e juros das parcelas
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Grupo 3: Suporte e sessão */}
        <div className="space-y-2">
          <h2 className="text-xs sm:text-[13px] font-bold text-slate-500 tracking-tight px-1">
            Suporte e sessão
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {/* Opção 1: Ajuda / Suporte */}
            <button
              type="button"
              onClick={() => handleSelectTab("ajuda")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#1a3a5c] transition-colors">
                    Ajuda / Suporte
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Dúvidas frequentes, guias rápidos e canal de atendimento
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Opção 2: Sair da Conta */}
            <button
              type="button"
              onClick={handleConfirmSignOut}
              disabled={isSigningOut}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-rose-50/60 transition-colors group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  {isSigningOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-rose-600 group-hover:text-rose-700 transition-colors">
                    {isSigningOut ? "Saindo da conta..." : "Sair da Conta"}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Encerrar a sessão atual neste dispositivo
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-200 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isSubPage = Boolean(
    tabParam &&
    [
      "notificacoes_pais",
      "notificacoes",
      "minhas_notificacoes",
      "rastreamento",
      "perfil",
      "pagamentos",
      "ajuda",
    ].includes(tabParam)
  );

  return (
    <div className="min-h-screen bg-surface max-w-4xl mx-auto space-y-6 pb-24">
      {/* Botão de Voltar nas Subpáginas */}
      {isSubPage && (
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1a3a5c] transition-colors group w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar para Conta
        </button>
      )}

      {/* Visão Ativa */}
      {renderCurrentView()}
    </div>
  );
});

export default Conta;
