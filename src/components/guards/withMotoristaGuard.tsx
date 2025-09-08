import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@/hooks/useSessionContext";
import { supabase } from "@/integrations/supabase/client";

export function withMotoristaGuard<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading, motorista, ensureMotoristaProfile } = useSessionContext();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && user) {
        ensureMotoristaProfile().then(() => {
          // Check after ensuring profile
          const checkMotorista = async () => {
            const { data: motoristaData } = await supabase.from("motoristas")
              .select("*")
              .eq("auth_uid", user.id)
              .maybeSingle();
            
            if (!motoristaData) {
              navigate("/login");
            }
          };
          checkMotorista();
        });
      } else if (!loading && !user) {
        navigate("/login");
      }
    }, [user, loading, ensureMotoristaProfile, navigate]);

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