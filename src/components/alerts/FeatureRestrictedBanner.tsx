import BaseAlert from "@/components/alerts/BaseAlert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureRestrictedBannerProps {
  message?: string;
}

export function FeatureRestrictedBanner({ message }: FeatureRestrictedBannerProps) {
  const navigate = useNavigate();

  if (!message) {
    message =
      "O seu plano não oferece essa funcionalidade. Assine um plano superior para ter acesso agora mesmo.";
  }

  return (
    <BaseAlert
      variant="warning"
      className="mb-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border border-amber-200"
      icon={AlertCircle}
      title="Acesso Restrito"
      description={message}
      highlight="Faça upgrade para liberar esta funcionalidade."
      actions={
        <Button
          onClick={() => navigate("/planos")}
          size="sm"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
        >
          Conhecer Planos
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      }
    />
  );
}
