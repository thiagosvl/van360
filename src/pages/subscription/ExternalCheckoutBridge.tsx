import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ExternalCheckoutBridge() {
  useSEO({
    title: "Conectando ao van360...",
    description: "Autenticação segura e rápida para acesso externo.",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthBridge = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
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

        toast.success("Conectado com sucesso!");
        navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION, { replace: true });
      } catch (err) {
        console.error("Erro na ponte de autenticação externa:", err);
        toast.error("Não foi possível autenticar. Faça login manualmente.");
        navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
      }
    };

    handleAuthBridge();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] to-[#0f2640] flex flex-col items-center justify-center p-6 text-white">
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-[#f59e0b] animate-spin" />
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="w-8 h-8 object-contain absolute brightness-0 invert"
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-headline font-bold text-xl">Conexão Segura</h3>
          <p className="text-white/60 text-sm max-w-[280px]">
            Estamos preparando seu ambiente de assinatura. Aguarde um instante...
          </p>
        </div>
      </div>
    </div>
  );
}
