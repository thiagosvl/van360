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
import { useNavigate } from "react-router-dom";
import AlterarSenhaDialog from "./AlterarSenhaDialog";
import EditarCadastroDialog from "./EditarCadastroDialog";

export function AppNavbar({ role }: { role: "admin" | "motorista" }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { pageTitle, pageSubtitle } = useLayout();
  const [openAlterarSenha, setOpenAlterarSenha] = useState(false);
  const [openEditarCadasto, setOpenEditarCadasto] = useState(false);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // 🔹 Faz o logout e espera o Supabase limpar a sessão
      await supabase.auth.signOut();

      // 🔹 Limpa qualquer cache local antes da troca de rota
      clearLoginStorageMotorista();

      // 🔹 Força revalidação manual do estado de sessão (evita re-render inesperado)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) console.warn("Sessão não finalizada ainda:", session);

      // 🔹 Agora redireciona com replace (evita flash)
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Erro ao encerrar sessão:", err);
    } finally {
      setIsSigningOut(false);
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
