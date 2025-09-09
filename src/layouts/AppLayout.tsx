import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { MotoristaSidebar } from '@/components/motorista/MotoristaSidebar';
import { MotoristaNavbar } from '@/components/motorista/MotoristaNavbar';

export default function AppLayout() {
  const { user } = useAuth();
  const role = (user?.app_metadata?.role as string | undefined) ?? (localStorage.getItem('app_role') || undefined);

  const isAdmin = role === 'admin';
  const isMotorista = role === 'motorista';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card">
          {isAdmin && <AdminSidebar />}
          {isMotorista && <MotoristaSidebar />}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <div className="border-b">
            {isAdmin && <AdminNavbar />}
            {isMotorista && <MotoristaNavbar />}
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}