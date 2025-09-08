import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@/hooks/useSessionContext";

export function withMotoristaGuard<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading, motorista, ensureMotoristaProfile } = useSessionContext();
    const navigate = useNavigate();

    useEffect(() => {
      if (loading) return;
      
      if (!user) {
        navigate("/login");
        return;
      }
      
      if (user && !motorista) {
        ensureMotoristaProfile().then((motoristaProfile) => {
          if (!motoristaProfile) {
            navigate("/login");
          }
        });
      }
    }, [user, loading, motorista, navigate]);

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