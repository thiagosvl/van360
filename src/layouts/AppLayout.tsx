import { AppNavbar } from "@/components/AppNavbar";
import { AppSidebar } from "@/components/AppSidebar";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Outlet } from "react-router-dom";

export default function AppLayout() {
  const { user, loading: loadingSession } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  // enquanto carrega sessão
  if (loadingSession || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // se não há perfil (usuário excluído)
  if (!profile) {
    supabase.auth.signOut();
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  const role = profile.role as "admin" | "motorista";

  return (
    <LayoutProvider>
      <div className="min-h-screen w-full bg-background">
        <div className="flex h-screen">
          <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-white">
            <div className="p-6 border-b">
              <img src="/assets/logo-van360.png" alt="Van360" className="h-16" />
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <AppSidebar role={role} />
            </div>
          </aside>

          <div className="flex-1 flex flex-col">
            <AppNavbar role={role} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
}
