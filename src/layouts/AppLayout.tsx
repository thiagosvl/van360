import AssinaturaPendenteAlert from "@/components/alerts/AssinaturaPendenteAlert";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { useAssinaturaPendente } from "@/hooks/business/useAssinaturaPendente";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { user, loading: loadingSession } = useSession();
  const { profile, isLoading, plano, role } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Bloquear indexação de todas as páginas protegidas (área logada)
  useSEO({
    noindex: true,
  });
  
  // Verificar se assinatura está pendente de pagamento ou em trial
  // Otimização: Passar objeto profile diretamente para evitar fetch duplo
  const assinaturaPendente = useAssinaturaPendente(profile);
  const { isPendente, assinaturaId } = assinaturaPendente;
  
  // Não exibir alerta na página /assinatura
  const shouldShowAlert = isPendente && assinaturaId && location.pathname !== "/assinatura";

  if (loadingSession || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    supabase.auth.signOut();
    localStorage.clear();
    return <Navigate to="/login" replace />;
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
              onClick={() => navigate("/inicio")}
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
          {shouldShowAlert && profile && (
            <AssinaturaPendenteAlert
              assinaturaId={assinaturaId!}
              userId={profile.id}
              {...assinaturaPendente}
            />
          )}
          <Outlet />
        </main>
      </div>
    </LayoutProvider>
  );
}
