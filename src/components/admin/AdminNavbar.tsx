import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminNavbar() {
  return (
    <header className="h-16 border-b bg-background flex items-center px-4">
      <SidebarTrigger className="mr-4" />
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">Sistema de Transporte</h1>
      </div>
      <div className="ml-auto">
        {/* Placeholder para menu do usuário */}
        <div className="w-8 h-8 rounded-full bg-muted"></div>
      </div>
    </header>
  );
}