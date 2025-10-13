// src/layouts/AppLayout.tsx
import { AppNavbar } from "@/components/AppNavbar";
import { AppSidebar } from "@/components/AppSidebar";
import { LayoutProvider } from "@/contexts/LayoutContext"; // 1. Importar
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const { user } = useAuth();
  const role =
    (user?.app_metadata?.role as string | undefined) ??
    (localStorage.getItem("app_role") || undefined);

  if (!role) return null;

  return (
    // 2. Envolver tudo com o LayoutProvider
    <LayoutProvider>
      <div className="min-h-screen w-full bg-background">
        <div className="flex h-screen">
          <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-white">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Zip Van</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <AppSidebar role={role as "admin" | "motorista"} />
            </div>
          </aside>

          <div className="flex-1 flex flex-col">
            <AppNavbar role={role as "admin" | "motorista"} />
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
}