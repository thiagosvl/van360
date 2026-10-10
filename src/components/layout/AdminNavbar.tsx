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
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300 px-4 sm:px-6 pt-[calc(0.75rem+var(--safe-area-top))] pb-3 flex items-center justify-between gap-3 sm:gap-6">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-2xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        {pageTitle && (
          <h1 className="hidden sm:block text-base sm:text-lg font-headline font-semibold text-foreground tracking-tight truncate">
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
            <Button variant="ghost" className="rounded-2xl p-1 pr-3 gap-2.5 border border-border/50 hover:bg-secondary data-[state=open]:bg-secondary transition-all">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-xs">
                {user?.nome?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-xs font-semibold text-foreground leading-tight">{user?.nome?.split(' ')[0] || 'Admin'}</span>
                <span className="text-[10px] font-normal text-muted-foreground leading-tight">Administrador</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl bg-card border-border shadow-lg text-card-foreground">
            <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Conta Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="rounded-xl px-2.5 py-2 flex items-center gap-2 text-sm font-medium hover:bg-secondary focus:bg-secondary cursor-pointer"
              onClick={openAlterarSenhaDialog}
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" /> Trocar Senha
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="rounded-xl px-2.5 py-2 flex items-center gap-2 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
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
