import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLayout } from "@/contexts/LayoutContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";

export function AppNavbar({ role }: { role: "admin" | "motorista" }) {
  const { profile } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { pageTitle, pageSubtitle } = useLayout();

  const handleSignOut = async () => {
    localStorage.removeItem("app_role");
    localStorage.removeItem("app_user_id");
    localStorage.removeItem("app_user_name");
    await supabase.auth.signOut();
  };

  return (
    <header
      className="flex flex-col justify-end bg-white border-b shadow-sm w-full z-10"
      style={{
        // 2. Adiciona o padding topo igual à área de segurança
        paddingTop: "env(safe-area-inset-top, 0px)",
        // Opcional: Adiciona padding lateral de segurança (útil em celulares com notch)
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {/* 3. ENVOLVA o conteúdo original em uma div com a altura fixa 'h-16' */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 sm:w-80 p-0">
                <SheetHeader className="flex flex-col items-center justify-center py-4 border-b">
                  <SheetTitle className="text-lg font-semibold">
                    Zip Van
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <AppSidebar
                    role={role}
                    onLinkClick={() => setIsSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            {/* 3. Exibir o título e subtítulo dinâmicos */}
            <h1 className="text-base sm:text-lg font-semibold leading-tight">
              {pageTitle}
            </h1>
            <p className="text-xs text-muted-foreground">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{profile.nome}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
