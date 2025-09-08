import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@/hooks/useSessionContext";

export function withAdminGuard<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading, admin, ensureAdminProfile } = useSessionContext();
    const navigate = useNavigate();

    useEffect(() => {
      if (loading) return;
      
      if (!user) {
        navigate("/admin/login");
        return;
      }
      
      if (user && !admin) {
        ensureAdminProfile().then((adminProfile) => {
          if (!adminProfile) {
            navigate("/admin/login");
          }
        });
      }
    }, [user, loading, admin, navigate]);

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