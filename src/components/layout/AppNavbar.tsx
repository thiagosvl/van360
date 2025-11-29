import AlterarSenhaDialog from "@/components/dialogs/AlterarSenhaDialog";
import EditarCadastroDialog from "@/components/dialogs/EditarCadastroDialog";
import { AppSidebar } from "@/components/layout/AppSidebar";
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
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { supabase } from "@/integrations/supabase/client";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { clearLoginStorageMotorista } from "@/utils/domain/motorista/motoristaUtils";
import {
  ChevronDown,
  Lock,
  LogOut,
  Menu,
  Receipt,
  UserPen,
} from "lucide-react";
import { useMemo, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";

export function AppNavbar({ role, plano }: { role: "motorista"; plano?: any }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { pageTitle } = useLayout();
  const [openAlterarSenha, setOpenAlterarSenha] = useState(false);
  const [openEditarCadasto, setOpenEditarCadasto] = useState(false);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();

      clearLoginStorageMotorista();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      redirect("/login");
    } catch (err) {
      // Erro ao encerrar sessão - não crítico, redirecionamento já foi feito
    } finally {
      setIsSigningOut(false);
    }
  };

  const userInitial = useMemo(() => {
    return profile?.nome.charAt(0)?.toUpperCase();
  }, [profile?.nome]);

  const userFirstName = useMemo(() => {
    return profile?.nome.split(" ")[0];
  }, [profile?.nome]);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-gray-100 bg-white">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 hover:bg-blue-50">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-80 border-r border-gray-100 bg-white p-0"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <SheetHeader className="flex flex-col items-center justify-center py-6 border-b border-gray-100">
                    <SheetTitle className="text-lg font-semibold tracking-wide">
                      <img
                        src="/assets/logo-van360.png"
                        alt="Van360"
                        className="h-14 cursor-pointer"
                        title="Van360"
                        onClick={() => {
                          navigate("/inicio");
                          setIsSheetOpen(false);
                        }}
                      />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-5">
                    <AppSidebar
                      role={role}
                      onLinkClick={() => setIsSheetOpen(false)}
                      plano={plano}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div>
              <h1 className="text-md sm:text-xl font-bold text-slate-900 leading-tight sm:text-3xl sm:text-2xl">
                {pageTitle || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-left hover:bg-slate-100">
                  <div className="h-10 w-10 rounded-full bg-primary/5 border border-primary/10 text-primary/60 flex items-center justify-center font-semibold uppercase">
                    <span>{userInitial}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:inline text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={() => navigate("/assinatura")}>
                  <Receipt className="mr-2 h-4 w-4" /> Minha Assinatura
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenEditarCadasto(true)}>
                  <UserPen className="mr-2 h-4 w-4" /> Editar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenAlterarSenha(true)}>
                  <Lock className="mr-2 h-4 w-4" /> Alterar senha
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
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
