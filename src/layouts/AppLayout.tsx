import { AppNavbar } from "@/components/AppNavbar";
import { AppSidebar } from "@/components/AppSidebar";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const isNative = Capacitor.isNativePlatform();
  const { profile, loading } = useAuth();

  if (loading) {
    return null;
  }

  const role = profile?.role;

  if (!role) return null;

  return (
    <LayoutProvider>
      <div
        className="w-full bg-background"
        style={{
          minHeight: "100vh",
          paddingTop: isNative ? "env(safe-area-inset-top)" : undefined,
          paddingBottom: isNative ? "env(safe-area-inset-bottom)" : undefined,
          backgroundColor: isNative ? "#ffffff" : undefined,
        }}
      >
        <div className="flex flex-col h-full">
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
            <main
              className="flex-1 overflow-y-auto p-4 md:p-6"
              style={{
                paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
              }}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
}
