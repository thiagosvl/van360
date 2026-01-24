
import { GlobalExpiryBanner } from "@/components/common/GlobalExpiryBanner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ROUTES } from "@/constants/routes";
import { LayoutProvider } from "@/contexts/LayoutProvider";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { useSubscriptionStatus } from "@/hooks/business/useSubscriptionStatus";
import { useSEO } from "@/hooks/useSEO";
import { apiClient } from "@/services/api/client";
import { clearAppSession } from "@/utils/domain";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

/* 
   Componente interno para consumir o contexto de Layout 
   (useSubscriptionStatus precisa estar DEPOIS do LayoutProvider)
*/
function AppLayoutContent({ plano, role }: { plano: any, role: "motorista" }) {
    const navigate = useNavigate();
    
    // Monitorar status da assinatura e abrir dialogs se necessário
    // AGORA SEGURO: Estamos dentro do LayoutProvider
    useSubscriptionStatus();

    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalExpiryBanner />
        <AppNavbar plano={plano} role={role} />

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
            <AppSidebar plano={plano} role={role} />
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
  const { profile, isLoading, plano, role } = usePermissions();

  // Bloquear indexação de todas as páginas protegidas (área logada)
  useSEO({
    noindex: true,
  });

  if (loadingSession || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <AutoRedirectToLogin />;
  }

  const currentRole = (role || "motorista") as "motorista";

  return (
    <LayoutProvider>
        <AppLayoutContent plano={plano} role={currentRole} />
    </LayoutProvider>
  );
}

function AutoRedirectToLogin() {
    useEffect(() => {
        const performLogout = async () => {
             try {
                await apiClient.post("/auth/logout");
             } catch (e) { console.error(e); }
             clearAppSession();
             window.location.href = ROUTES.PUBLIC.LOGIN;
        };
        performLogout();
    }, []);
    
    // Renderiza um spinner simples enquanto redireciona
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
}
