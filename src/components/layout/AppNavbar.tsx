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
  ChevronDown,
  HelpCircle,
  Lock,
  Loader2,
  LogOut,
  UserPen,
  Key,
  Rocket,
  IdCard,
  Menu,
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
    setIsGlobalLoading
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

  const userInitial = useMemo(() => {
    return profile?.nome.charAt(0)?.toUpperCase();
  }, [profile?.nome]);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md h-[calc(4rem+var(--safe-area-top))] sm:h-[calc(5rem+var(--safe-area-top))] pt-[var(--safe-area-top)] transition-all">
      <div className="flex h-full items-center justify-between px-4 sm:px-8 relative">
        {/* Esquerda: Logo (Mobile) / Título (Desktop) */}
        <div className="flex-1 flex items-center min-w-0">
          {/* Logo - Apenas Mobile */}
          <div className="flex md:hidden shrink-0">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
            />
          </div>

          {/* Título da Página - Apenas Desktop */}
          <div className="hidden md:flex items-center gap-3 min-w-0">
            {currentPage && (
              <>
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[#1a3a5c]">
                  <currentPage.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-lg font-bold text-[#1a3a5c] tracking-tight leading-none truncate">
                    {currentPage.title}
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Centro: Título da Página (Apenas Mobile) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:hidden w-[40%] sm:w-[50%]">
          {currentPage && (
            <h2 className="text-[15px] sm:text-base font-bold text-[#1a3a5c] tracking-tight leading-none truncate text-center w-full px-1">
              {currentPage.title}
            </h2>
          )}
        </div>

        {/* Direita: Ajuda (Mobile) e Perfil de Usuário */}
        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
          {/* Perfil de Usuário / Menu Hamburger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-x-1.5 outline-none p-1 sm:p-0">
                {/* Mobile: Avatar com inicial + seta */}
                <div className="md:hidden flex items-center gap-x-1.5">
                  <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#1a3a5c] font-bold text-sm group-hover:bg-slate-50 group-hover:text-primary transition-all shadow-sm">
                    {isLoadingProfile ? (
                      <Skeleton className="h-full w-full rounded-2xl" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                {/* Desktop: Menu Hamburger */}
                <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-slate-200 text-[#1a3a5c] hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
                  <Menu className="h-7 w-7" strokeWidth={2.5} />
                </div>
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
