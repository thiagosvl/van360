import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import {
  HelpCircle,
  Lock,
  Loader2,
  LogOut,
  UserPen,
  Key,
  Rocket,
  IdCard,
  Route,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFirstName } from "@/utils/formatters";

export function AppNavbar({ role }: { role: "motorista" }) {
  const {
    openAlterarSenhaDialog,
    openEditarCadastroDialog,
    openEditarPixDialog,
    setIsHelpOpen,
    setIsGlobalLoading,
    pageTitle
  } = useLayout();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);

  let currentPage: any = pagesItems.find(item => item.href === location.pathname);
  if (!currentPage && location.pathname.startsWith("/passageiros/")) {
    currentPage = {
      title: "Carteirinha",
      href: location.pathname,
      icon: IdCard,
    };
  }

  const displayTitle = currentPage?.title || pageTitle;

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setIsGlobalLoading(true, "Encerrando sessão...");

    try {
      // 1. Chamamos a SUA API de logout (Centralizador do Logout)
      // Se der erro, prosseguimos limpando a casa localmente de qualquer forma.
      try {
        await apiClient.post("/auth/logout");
      } catch (err) {
        // Ignoramos erros do backend no logout para não travar o usuário
      }

      // 2. Limpa o Storage e redireciona (SessionManager agora faz logout LOCAL)
      await sessionManager.signOut();
      window.location.href = ROUTES.PUBLIC.LOGIN;
    } catch (err) {
      // Em caso de erro crítico, forçamos a saída local
      clearAppSession();
      window.location.href = ROUTES.PUBLIC.LOGIN;
    }
  };

  const userInitials = useMemo(() => {
    if (!profile?.nome) return "U";
    const nameParts = profile.nome.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  }, [profile?.nome]);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md h-[calc(4rem+var(--safe-area-top))] sm:h-[calc(5rem+var(--safe-area-top))] pt-[var(--safe-area-top)] transition-all">
      <div className="flex h-full items-center justify-between px-4 sm:px-8 relative">
        <div className="flex-1 flex items-center min-w-0">
          <div className="flex md:hidden shrink-0">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
            />
          </div>

          <div className="hidden md:flex items-center gap-3 min-w-0">
            {displayTitle && (
              <>
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[#1a3a5c]">
                  {currentPage?.icon ? (
                    <currentPage.icon className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Route className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-lg font-bold text-[#1a3a5c] tracking-tight leading-none truncate">
                    {displayTitle}
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:hidden max-w-[55%] sm:max-w-[60%] pointer-events-none">
          {displayTitle && (
            <h2 className="text-[15px] sm:text-base font-bold text-[#1a3a5c] tracking-tight leading-tight truncate text-center">
              {displayTitle}
            </h2>
          )}
        </div>

        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex flex-col items-center justify-center outline-none p-0.5 transition-all cursor-pointer">
                <div className="h-[34px] w-[34px] md:h-[37px] md:w-[37px] rounded-full bg-slate-50 border border-slate-200 text-[#1a3a5c] flex items-center justify-center shadow-xs group-hover:bg-slate-200/80 group-hover:border-slate-300 transition-all">
                  {isLoadingProfile ? (
                    <Skeleton className="h-full w-full rounded-full" />
                  ) : (
                    <User className="h-5 w-5 md:h-[21px] md:w-[21px] text-[#1a3a5c]" />
                  )}
                </div>
                <span className="text-[10px] md:text-[11.5px] font-medium text-slate-500 group-hover:text-slate-800 leading-none mt-0.5 md:mt-1">
                  Conta
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 rounded-xl p-1 shadow-xl border-gray-100" align="end">
              <div className="px-3 py-2.5 border-b border-gray-50 mb-1">
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Bem-vindo (a),</p>
                {isLoadingProfile ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 truncate">{formatFirstName(profile?.nome)}</p>
                )}
              </div><DropdownMenuItem onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION)} className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer font-medium text-sm">
                <Rocket className="h-4 w-4 text-slate-400" />
                Minha Assinatura
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openEditarCadastroDialog} className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer font-medium text-sm">
                <UserPen className="h-4 w-4 text-slate-400" />
                Editar Cadastro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openAlterarSenhaDialog} className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer font-medium text-sm">
                <Lock className="h-4 w-4 text-slate-400" />
                Alterar Senha
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openEditarPixDialog} className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer font-medium text-sm">
                <Key className="h-4 w-4 text-slate-400" />
                Chave Pix
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsHelpOpen(true)} className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer font-medium text-sm">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                Ajuda / Suporte
              </DropdownMenuItem>
              <div className="h-px bg-gray-50 my-1" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer font-medium text-sm text-rose-500 focus:text-rose-500 hover:bg-rose-50 transition-colors"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
