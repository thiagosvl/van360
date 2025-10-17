import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AppGateProps {
  children: React.ReactNode;
}

export const AppGate = ({ children }: AppGateProps) => {
  const { user, session, loading, profile } = useAuth();
  const location = useLocation();

  const role = profile?.role; 
  
  useEffect(() => {
    if (profile) {
      localStorage.setItem("app_user_id", profile.id);
      localStorage.setItem("app_role", profile.role);
    } else if (!user && !session && !loading) {
      localStorage.removeItem("app_user_id");
      localStorage.removeItem("app_role");
    }
  }, [profile, user, session, loading]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !user) {
    const isProtected = 
        location.pathname.startsWith("/admin") || 
        (location.pathname !== "/" && location.pathname !== "/login");
    
    if (isProtected) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  }

  if (location.pathname === "/login") {
    if (!role) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
      
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/inicio" replace />;
  }

  if (role === "admin") {
    if (location.pathname === "/admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (!location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } else if (role === "motorista") {
    const allowedRoutes = [
      "/inicio",
      "/passageiros",
      "/mensalidades",
      "/escolas",
      "/configuracoes",
      "/gastos",
      "/relatorios"
    ];
    
    const isAllowedRoute = allowedRoutes.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(`${route}/`)
    );

    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/inicio" replace />;
    }
    
    if (!isAllowedRoute) {
      return <Navigate to="/inicio" replace />;
    }
  }
  
  return <>{children}</>;
};