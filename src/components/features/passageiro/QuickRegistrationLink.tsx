import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { usePassengerLimits } from "@/hooks/business/usePassengerLimits";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { toast } from "@/utils/notifications/toast";
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, Copy, LinkIcon, Lock, MessageCircle } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("share_header_collapsed") === "true";
    }
    return false;
  });

  const navigate = useNavigate();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("share_header_collapsed", String(newState));
  };

  const allowAccess = useMemo(() => {
    if (!plano) return false;
    return plano.isValidPlan;
  }, [plano]);

  // Use the centralized hook for limits
  const { isLimitReached, limitePassageiros } = usePassengerLimits({
    plano,
    profile,
    currentCount: countPassageiros,
  });

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

  const handleShareWhatsApp = () => {
    if (!profile?.id) return;
    const link = buildPrepassageiroLink(profile.id);
    const message = `Olá! Clique no link abaixo para cadastrar seu filho(a) no transporte escolar: ${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Card
      className={`rounded-2xl shadow-sm transition-all duration-300 ${
        allowAccess
          ? "bg-white border-blue-100 shadow-blue-50/50"
          : "bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 border-none text-white shadow-lg relative overflow-hidden"
      }`}
    >
      <CardContent className="p-0 relative z-10">
        {/* Mobile Collapsed Header */}
        <div 
          className={`md:hidden px-4 py-3 flex items-center justify-between cursor-pointer ${!isCollapsed ? "hidden" : "flex"}`}
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              allowAccess ? "bg-blue-50 text-blue-600" : "bg-white/20 text-white"
            }`}>
              <LinkIcon className="h-4 w-4" />
            </div>
            <span className={`font-semibold ${allowAccess ? "text-blue-700" : "text-white"}`}>
              Seu Link de Cadastro
            </span>
          </div>
          <ChevronDown className={`h-5 w-5 ${allowAccess ? "text-blue-400" : "text-white/70"}`} />
        </div>

        {/* Full Content (Desktop always visible, Mobile visible if not collapsed) */}
        <div className={`p-5 ${isCollapsed ? "hidden md:block" : "block"}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left w-full sm:w-auto relative">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                  allowAccess
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white/20 text-white backdrop-blur-sm"
                }`}
              >
                {allowAccess ? (
                  <LinkIcon className="h-6 w-6" />
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <h3
                    className={`text-lg font-bold leading-tight ${
                      allowAccess ? "text-blue-700" : "text-white"
                    }`}
                  >
                    {allowAccess
                      ? "Link de Cadastro Rápido"
                      : "Desbloqueie o Cadastro Rápido"}
                  </h3>
                  {/* Mobile Collapse Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse();
                    }}
                    className="md:hidden p-1 -mr-2 text-blue-400 hover:bg-blue-50 rounded-full"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>
                <p
                  className={`text-sm mt-1 max-w-md ${
                    allowAccess
                      ? "text-blue-600/80"
                      : "text-indigo-100"
                  }`}
                >
                  {allowAccess
                    ? "Copie o link e envie ao responsável. O cadastro cai direto aqui na sua lista."
                    : "Permita que os pais se cadastrem sozinhos. Ganhe tempo e profissionalize seu negócio."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
              {allowAccess ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShareWhatsApp}
                    className="font-semibold border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all w-full sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCopyLink}
                    className={`font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all w-full sm:w-auto ${
                      isCopied ? "bg-green-50 text-green-700 border-green-200" : ""
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/planos")}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none shadow-sm w-full sm:w-auto"
                >
                  Quero essa facilidade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Decorative background elements for locked state */}
      {!allowAccess && (
        <>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>
        </>
      )}
    </Card>
  );
}
