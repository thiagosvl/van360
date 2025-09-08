import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MotoristaSidebar } from "@/components/motorista/MotoristaSidebar";
import { MotoristaNavbar } from "@/components/motorista/MotoristaNavbar";

export function MotoristaLayout() {
  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full">
        <MotoristaSidebar />
        <div className="flex-1 flex flex-col">
          <MotoristaNavbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}