import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { toast } from "@/utils/notifications/toast";
import { ArrowRight, CheckCircle, Copy, LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface QuickRegistrationLinkProps {
  profile: any;
  plano: any;
  blueTheme?: boolean;
  countPassageiros?: number;
}

export function QuickRegistrationLink({
  profile,
  plano,
  blueTheme = false,
  countPassageiros,
}: QuickRegistrationLinkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const allowAccess = useMemo(() => {
    if (!plano) return false;
    if (plano.isFreePlan) return false;
    return plano.isValidPlan;
  }, [plano]);

  const limitePassageiros = plano?.planoCompleto?.limite_passageiros ?? 0;
  const ativos = Number(countPassageiros) || 0;

  // Aplicar limite apenas para plano Gratuito
  // Plano Essencial (trial) não tem limite para maximizar lock-in
  const shouldApplyLimit = plano?.isFreePlan;

  const isLimitReached = shouldApplyLimit && limitePassageiros > 0 && ativos >= limitePassageiros;

  const handleCopyLink = () => {
    if (!profile?.id) {
      toast.error("erro.operacao", {
        description: "ID do usuário não encontrado.",
      });
      return;
    }

    try {
      navigator.clipboard.writeText(buildPrepassageiroLink(profile?.id));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (error: any) {
      toast.error("sistema.erro.falhaCopiar", {
        description: error.message || "Não foi possível copiar o link.",
      });
    }
  };

  return (
    <Card
      className={`py-4 rounded-xl shadow-sm ${
        blueTheme
          ? "bg-white border-blue-100 shadow-blue-50/50"
          : "bg-white border-gray-200"
      }`}
    >
      <CardContent className="py-3 px-3 md:px-6 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
          <LinkIcon className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-blue-600 leading-snug">
              Link de Cadastro Rápido
            </p>
            <p className="text-sm text-blue-900 mt-1">
              Copie o link e envie ao responsável do passageiro para que ele
              inicie o cadastro.
            </p>
          </div>
        </div>

        {allowAccess && !isLimitReached ? (
          <Button
            variant="outline"
            title={isCopied ? "Copiado!" : "Copiar"}
            className="text-blue-700 border-gray-200 hover:bg-blue-100 hover:text-blue shrink-0 transition-colors duration-200"
            onClick={handleCopyLink}
          >
            {isCopied ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isCopied ? "Copiado!" : "Copiar Link"}
          </Button>
        ) : (
          <div className="flex flex-col items-center sm:items-end gap-1">
            {allowAccess && isLimitReached ? (
              <>
                <span className="text-xs text-red-700 font-semibold mb-1 mt-2 text-center sm:text-right max-w-[220px]">
                  Você atingiu o limite de {limitePassageiros} passageiros
                </span>
                <Button
                  variant="default"
                  className="shrink-0 opacity-95 px-3 py-1"
                  onClick={() => navigate("/planos")}
                  title="Assine um plano para adicionar mais passageiros"
                >
                  Quero Passageiros Ilimitados
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-xs text-red-700 font-semibold mb-1 mt-2 text-center sm:text-right max-w-[220px]">
                  Indisponível no plano atual
                </span>
                <Button
                  variant="default"
                  className="shrink-0 opacity-95 px-3 py-1"
                  onClick={() => navigate("/planos")}
                  aria-disabled
                  title="Disponível em outros planos"
                >
                  Conhecer Planos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
