import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AppGateProps {
  children: React.ReactNode;
}

export const AppGate = ({ children }: AppGateProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  const [roleDb, setRoleDb] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (user) {
        try {
          const { data } = await supabase
            .from("usuarios")
            .select("id, role, asaas_subaccount_api_key")
            .eq("email", user.email as string)
            .single();
          if (active && data?.role) {
            setRoleDb(data.role);
            localStorage.setItem("app_role", data.role);
          }
          if (data.id) {
            localStorage.setItem("app_user_id", data.id);
          }
          if (data?.asaas_subaccount_api_key) {
            localStorage.setItem(
              "asaas_api_key",
              data.asaas_subaccount_api_key
            );
          }
        } finally {
        }
      }
    }

    loadRole();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const role =
    (user?.app_metadata?.role as string | undefined) ??
    roleDb ??
    (localStorage.getItem("app_role") || undefined);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !user) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/login" replace />;
    }
    if (location.pathname !== "/" && location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  if (location.pathname === "/login") {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "motorista") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  if (role === "admin") {
    if (location.pathname === "/admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (!location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  else if (role === "motorista") {
    const allowedRoutes = [
      "/dashboard",
      "/passageiros",
      "/mensalidades",
      "/escolas",
      "/configuracoes",
      "/gastos",
    ];
    const isAllowedRoute = allowedRoutes.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + "/")
    );

    if (!isAllowedRoute) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  else {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
