import { cn } from "@/lib/utils";
import { Search, Bell, Menu, User, LogOut, Settings } from "lucide-react";
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    await sessionManager.signOut();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-500 px-6 py-4 flex items-center justify-between">
      {/* Search Bar Area */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-500"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="relative group flex-1 hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-[#1a3a5c]" />
          <input 
            type="text" 
            placeholder="Pesquisar motoristas, veículos ou logs..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-slate-600 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-50 text-slate-400 hover:text-[#1a3a5c]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-emerald-500 rounded-full border-2 border-white" />
        </Button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-slate-100 mx-2 hidden sm:block" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-2xl p-1 pr-3 gap-3 border border-transparent hover:bg-slate-50 hover:border-slate-100 data-[state=open]:bg-slate-50 transition-all">
              <div className="h-9 w-9 rounded-xl bg-[#1a3a5c] flex items-center justify-center text-white font-black text-xs shadow-sm shadow-[#1a3a5c]/20">
                {user?.nome?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-[11px] font-black uppercase text-[#1a3a5c] tracking-tight">{user?.nome?.split(' ')[0] || 'Admin'}</span>
                <span className="text-[9px] font-bold text-slate-400 leading-none">Administrador</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-diff-shadow">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">Conta Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-slate-600 focus:bg-slate-50 focus:text-[#1a3a5c]">
              <User className="h-4 w-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-slate-600 focus:bg-slate-50 focus:text-[#1a3a5c]" onClick={() => navigate(ROUTES.PRIVATE.ADMIN.SETTINGS)}>
              <Settings className="h-4 w-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem 
               className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-destructive focus:bg-destructive/5 focus:text-destructive"
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
