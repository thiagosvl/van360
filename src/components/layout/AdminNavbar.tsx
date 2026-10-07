import { useMatch } from "react-router-dom";
import { useLayout } from "@/contexts/LayoutContext";
import { Menu, LogOut, KeyRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/business/useSession";
import { sessionManager } from "@/services/sessionManager";
import { apiClient } from "@/services/api/client";
import { ROUTES } from "@/constants/routes";
import { AdminUserQuickSwitcher } from "@/components/features/admin/AdminUserQuickSwitcher";

interface AdminNavbarProps {
  onMenuToggle?: () => void;
}

export function AdminNavbar({ onMenuToggle }: AdminNavbarProps) {
  const { user } = useSession();
  const { pageTitle, openAlterarSenhaDialog } = useLayout();
  const userDetailsMatch = useMatch(ROUTES.PRIVATE.ADMIN.USER_DETAILS);
  const currentUserId = userDetailsMatch?.params.id;

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignora erro de backend no logout para garantir saída do usuário
    }
    await sessionManager.signOut();
    window.location.href = ROUTES.PUBLIC.LOGIN;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d1424]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-500 px-4 sm:px-6 pt-[calc(1rem+var(--safe-area-top))] pb-4 flex items-center justify-between gap-3 sm:gap-6">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-300"
        >
          <Menu className="h-5 w-5" />
        </button>
        {pageTitle && (
          <h1 className="hidden sm:block text-base sm:text-base md:text-xl font-bold text-slate-100 tracking-tight truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <AdminUserQuickSwitcher currentUserId={currentUserId} className="w-full" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-2xl p-1 pr-3 gap-3 border border-transparent hover:bg-slate-800/80 hover:border-slate-700 data-[state=open]:bg-slate-800 transition-all">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-600/30">
                {user?.nome?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-[11px] font-black uppercase text-slate-100 tracking-tight">{user?.nome?.split(' ')[0] || 'Admin'}</span>
                <span className="text-[9px] font-bold text-slate-400 leading-none">Administrador</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-[#131b2e] border-slate-800 shadow-2xl text-slate-100">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">Conta Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white focus:bg-slate-800/80 focus:text-white cursor-pointer"
              onClick={openAlterarSenhaDialog}
            >
              <KeyRound className="h-4 w-4 text-slate-400" /> Trocar Senha
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
