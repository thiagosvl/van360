import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface AppGateProps {
  children: React.ReactNode;
}

export const AppGate = ({ children }: AppGateProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no session, redirect to login (except if already on login page)
  if (!session || !user) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  // Get user role from app_metadata
  const role = user.app_metadata?.role;

  // If user is authenticated but on login page, redirect to appropriate dashboard
  if (location.pathname === '/login') {
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'motorista') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Role-based route protection
  if (role === 'admin') {
    // Admin can only access /admin/** routes
    if (!location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin" replace />;
    }
  } else if (role === 'motorista') {
    // Motorista can access specific routes
    const allowedRoutes = ['/dashboard', '/passageiros', '/mensalidades', '/escolas'];
    const isAllowedRoute = allowedRoutes.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );
    
    if (!isAllowedRoute) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};