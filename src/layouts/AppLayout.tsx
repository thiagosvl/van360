import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ROUTES } from "@/constants/routes";
import { LayoutProvider } from "@/contexts/LayoutProvider";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useSEO } from "@/hooks/useSEO";
import { Outlet, useNavigate } from "react-router-dom";

function AppLayoutContent({ role }: { role: "motorista" }) {
    const navigate = useNavigate();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar role={role} />

        <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-72 flex-col border-r border-gray-100 bg-white">
          <div className="flex h-20 items-center gap-3 px-6">
            <img
              src="/assets/logo-van360.png"
              alt="Van360"
              className="h-12 cursor-pointer"
              title="Van360"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Van360
              </p>
              <p className="text-xs text-slate-500">Painel Operacional</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <AppSidebar role={role} />
          </div>
        </aside>

        <main className="pt-[5.5rem] pb-10 md:pb-12 px-4 sm:px-6 lg:px-10 md:ml-72 min-h-screen">
          <Outlet />
        </main>
      </div>
    );
}

export default function AppLayout() {
  const { user, loading: loadingSession } = useSession();
  const { profile, isLoading, isError, error } = useProfile(user?.id);

  // Bloquear indexação de todas as páginas protegidas (área logada)
  useSEO({
    noindex: true,
  });

  if (isError) {
    console.error("Erro ao carregar perfil:", error);
  }

  if (loadingSession || isLoading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LayoutProvider>
        <AppLayoutContent role="motorista" />
    </LayoutProvider>
  );
}
