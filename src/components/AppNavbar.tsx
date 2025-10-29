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
import { supabase } from "@/integrations/supabase/client";
import { safeCloseDialog } from "@/utils/dialogCallback";
import { clearLoginStorageMotorista } from "@/utils/motoristaUtils";
import { Lock, LogOut, Menu, User, UserPen } from "lucide-react";
import { useState } from "react";
import AlterarSenhaDialog from "./AlterarSenhaDialog";
import EditarCadastroDialog from "./EditarCadastroDialog";

export function AppNavbar({ role }: { role: "admin" | "motorista" }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { pageTitle, pageSubtitle } = useLayout();
  const [openAlterarSenha, setOpenAlterarSenha] = useState(false);
  const [openEditarCadasto, setOpenEditarCadasto] = useState(false);

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
      clearLoginStorageMotorista();

      window.location.href = "/login";
    }
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 sm:w-80 p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetHeader className="flex flex-col items-center justify-center py-4 border-b">
                  <SheetTitle className="text-lg font-semibold">
                    <img
                      src="/assets/logo-van360.png"
                      alt="Van360"
                      className="h-16"
                    />
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
            <DropdownMenuItem onClick={() => setOpenEditarCadasto(true)}>
              <UserPen className="mr-2 h-4 w-4" /> Editar cadastro
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setOpenAlterarSenha(true)}>
              <Lock className="mr-2 h-4 w-4" /> Alterar senha
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {openAlterarSenha && (
        <AlterarSenhaDialog
          isOpen={openAlterarSenha}
          onClose={() => safeCloseDialog(() => setOpenAlterarSenha(false))}
        />
      )}
      {openEditarCadasto && (
        <EditarCadastroDialog
          isOpen={openEditarCadasto}
          onClose={() => safeCloseDialog(() => setOpenEditarCadasto(false))}
        />
      )}
    </>
  );
}
