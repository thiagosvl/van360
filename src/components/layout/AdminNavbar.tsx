import { useLayout } from "@/contexts/LayoutContext";
import { Menu, LogOut } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface AdminNavbarProps {
  onMenuToggle?: () => void;
}

export function AdminNavbar({ onMenuToggle }: AdminNavbarProps) {
  const { user } = useSession();
  const { pageTitle } = useLayout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await sessionManager.signOut();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d1424]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-500 px-4 sm:px-6 pt-[calc(1rem+var(--safe-area-top))] pb-4 flex items-center justify-between">
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-300"
        >
          <Menu className="h-5 w-5" />
        </button>
        {pageTitle && (
          <h1 className="text-base sm:text-lg font-headline font-black text-white uppercase tracking-wider">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* User Profile */}
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
              className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sair do Painel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
