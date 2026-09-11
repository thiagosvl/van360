import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "@/utils/notifications/toast";
import { InitialLoading } from "@/components/auth/InitialLoading";

export default function ImpersonateBridgePage() {
  useSEO({
    title: "Conectando como motorista...",
    noindex: true,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleImpersonate = async () => {
      const tokenHash = searchParams.get("token_hash") || searchParams.get("token");

      if (!tokenHash) {
        toast.error("Link de acesso inválido ou expirado.");
        navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "magiclink",
        });

        if (error) {
          throw error;
        }

        navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
      } catch (err) {
        console.error("Erro ao validar token de acesso:", err);
        toast.error("Link de acesso expirado ou inválido. Gere um novo no painel admin.");
        navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
      }
    };

    handleImpersonate();
  }, [searchParams, navigate]);

  return <InitialLoading />;
}
