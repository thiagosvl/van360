import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@/hooks/useSessionContext";

export function withMotoristaGuard<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading, motorista } = useSessionContext();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          navigate("/login");
        } else if (!motorista) {
          navigate("/login");
        }
      }
    }, [user, loading, motorista, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Carregando...</div>
        </div>
      );
    }

    if (!user || !motorista) {
      return null;
    }

    return <Component {...props} />;
  };
}