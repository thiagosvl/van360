import { AppNavbar } from "@/components/AppNavbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const { user } = useAuth();
  const role =
    (user?.app_metadata?.role as string | undefined) ??
    (localStorage.getItem("app_role") || undefined);

  if (!role) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        <div className="flex h-screen">
          <div className="w-64 border-r bg-card">
            <AppSidebar role={role as "admin" | "motorista"} />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="border-b">
              <AppNavbar role={role as "admin" | "motorista"} />
            </div>
            <main className="flex-1 overflow-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
