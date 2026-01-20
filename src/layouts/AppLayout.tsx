
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ROUTES } from "@/constants/routes";
import { LayoutProvider } from "@/contexts/LayoutProvider";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { useSEO } from "@/hooks/useSEO";
import { apiClient } from "@/services/api/client";
import { clearAppSession } from "@/utils/domain";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { user, loading: loadingSession } = useSession();
  const { profile, isLoading, plano, role } = usePermissions();
  const navigate = useNavigate();

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar perfil
          </h1>
          <p className="text-gray-500 mb-6">
            Não foi possível encontrar seus dados de usuário. Redirecionando para login em 5 segundos...
          </p>
          <div className="flex flex-col gap-3">
             <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tentar Novamente Agora
            </button>
            <button
              onClick={async () => {
                try {
                   await apiClient.post("/auth/logout");
                } catch (e) {
                   console.error("Erro logout", e);
                }
                clearAppSession();
                window.location.href = ROUTES.PUBLIC.LOGIN;
              }}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para Login
            </button>
          </div>
          {/* Auto Redirect Script */}
          <AutoRedirectToLogin />
        </div>
      </div>
    );
  }

function AutoRedirectToLogin() {
    useEffect(() => {
        const timer = setTimeout(async () => {
             try {
                await apiClient.post("/auth/logout");
             } catch (e) { console.error(e); }
             clearAppSession();
             window.location.href = ROUTES.PUBLIC.LOGIN;
        }, 5000);
        return () => clearTimeout(timer);
    }, []);
    return null;
}

  const currentRole = (role || "motorista") as "motorista";

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50">
        <AppNavbar plano={plano} role={currentRole} />

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
            <AppSidebar plano={plano} role={currentRole} />
          </div>
        </aside>

        <main className="pt-[5.5rem] pb-10 md:pb-12 px-4 sm:px-6 lg:px-10 md:ml-72 min-h-screen">
          <Outlet />
        </main>
      </div>
    </LayoutProvider>
  );
}
