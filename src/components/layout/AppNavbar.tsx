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
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import {
  ChevronDown,
  HelpCircle,
  Lock,
  LogOut,
  UserPen,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";

export function AppNavbar({ role }: { role: "motorista" }) {
  const {
    openAlterarSenhaDialog,
    openEditarCadastroDialog,
    setIsHelpOpen
  } = useLayout();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const currentPage = pagesItems.find(item => item.href === location.pathname);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await apiClient.post("/auth/logout");
      clearAppSession(true);
      window.location.href = ROUTES.PUBLIC.LOGIN;
    } catch (err) {
      // Erro ao encerrar sessão - não crítico
    } finally {
      setIsSigningOut(false);
    }
  };

  const userInitial = useMemo(() => {
    return profile?.nome.charAt(0)?.toUpperCase();
  }, [profile?.nome]);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md h-16 sm:h-20 transition-all">
      <div className="flex h-full items-center justify-between px-4 sm:px-8 relative">
        {/* Esquerda: Central de Ajuda (Mobile) / Título (Desktop) */}
        <div className="flex-1 flex items-center">
          {/* Botão de Ajuda - Apenas Mobile */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="md:hidden group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all p-1.5"
          >
            <div className="h-9 w-9 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
              <HelpCircle className="h-5 w-5" />
            </div>
          </button>

          {/* Título da Página - Apenas Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {currentPage && (
              <>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                  <currentPage.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Seção Atual</p>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                    {currentPage.title}
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Centro: Logo (Apenas mobile) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:hidden">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-9 sm:h-12 w-auto cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
          />
        </div>

        {/* Direita: Perfil de Usuário */}
        <div className="flex-1 flex justify-end items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-x-2 outline-none p-1">
                <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm sm:text-base group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <span>{userInitial}</span>
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 rounded-[22px] p-2 shadow-2xl border-gray-100" align="end">
              <div className="px-3 py-3 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bem-vindo(a),</p>
                <p className="text-sm font-black text-slate-900 truncate">{profile?.nome}</p>
              </div>
              <DropdownMenuItem onClick={openEditarCadastroDialog} className="rounded-xl px-3 py-2.5">
                <UserPen className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-semibold text-sm">Gerenciar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openAlterarSenhaDialog} className="rounded-xl px-3 py-2.5">
                <Lock className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-semibold text-sm">Alterar Senha</span>
              </DropdownMenuItem>
              <div className="h-px bg-gray-50 my-1.5" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-rose-500 rounded-xl px-3 py-2.5 bg-rose-50/30 hover:bg-rose-50 transition-colors"
                disabled={isSigningOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold text-sm">Encerrar Sessão</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
