import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { InitialLoading } from "@/components/auth/InitialLoading";

import { extractCheckoutBridgeParams } from "@/utils/checkoutBridgeUtils";

export default function ExternalCheckoutBridge() {
  useSEO({
    title: "Conectando ao van360...",
    description: "Autenticação segura e rápida para acesso externo.",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthBridge = async () => {
      const tokenHash = searchParams.get("token_hash") || searchParams.get("token");
      const autoOpen = searchParams.get("auto_open") === "true";
      const querySuffix = autoOpen ? "?open_checkout=true" : "";
      const targetRoute = `${ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION}${querySuffix}`;

      if (tokenHash) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "magiclink",
          });

          if (error) {
            throw error;
          }

          navigate(targetRoute, { replace: true });
          return;
        } catch (err) {
          console.error("Erro ao validar token mágico de acesso:", err);
          toast.error("Link de acesso expirado ou inválido. Faça login manualmente.");
          navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
          return;
        }
      }

      const { accessToken, refreshToken, isValid } = extractCheckoutBridgeParams(searchParams);

      if (!isValid || !accessToken || !refreshToken) {
        toast.error("Sessão expirada ou inválida. Faça login novamente.");
        navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
        return;
      }

      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        navigate(targetRoute, { replace: true });
      } catch (err) {
        console.error("Erro na ponte de autenticação externa:", err);
        toast.error("Não foi possível autenticar. Faça login manualmente.");
        navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
      }
    };

    handleAuthBridge();
  }, [searchParams, navigate]);

  return <InitialLoading />;
}
