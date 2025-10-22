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
import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";

export function AppNavbar({ role }: { role: "admin" | "motorista" }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { pageTitle, pageSubtitle } = useLayout();

  const handleSignOut = async () => {
    try {
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Erro ao realizar logout:", error);
      } else {
        console.warn(
          "Nenhuma sessão ativa encontrada, limpando localStorage..."
        );
      }
    } catch (err) {
      console.error("Erro inesperado ao tentar logout:", err);
    } finally {
      const keys = [
        "app_role",
        "app_user_id",
        STORAGE_KEY_QUICKSTART_STATUS,
        "user",
        "authTokens",
      ];

      keys.forEach((k) => localStorage.removeItem(k));

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") && key.includes("-auth-token")) {
          localStorage.removeItem(key);
        }
      });

      window.location.href = "/login";
    }
  };

  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white border-b shadow-sm">
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
                  Van360
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
          <h1 className="text-base sm:text-lg font-semibold leading-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-muted-foreground">{pageSubtitle}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
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
