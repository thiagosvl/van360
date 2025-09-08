import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@/hooks/useSessionContext";
import { supabase } from "@/integrations/supabase/client";

export function withAdminGuard<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading, admin, ensureAdminProfile } = useSessionContext();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && user) {
        ensureAdminProfile().then(() => {
          // Check after ensuring profile
          const checkAdmin = async () => {
            const { data: adminData } = await supabase.from("admins")
              .select("*")
              .eq("auth_uid", user.id)
              .maybeSingle();
            
            if (!adminData) {
              navigate("/admin/login");
            }
          };
          checkAdmin();
        });
      } else if (!loading && !user) {
        navigate("/admin/login");
      }
    }, [user, loading, ensureAdminProfile, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Carregando...</div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}