import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openBrowserLink } from "@/utils/browser";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { toast } from "@/utils/notifications/toast";
import {
  Copy,
  CopyCheck,
  LinkIcon,
  MessageCircle
} from "lucide-react";
import { useState } from "react";

interface QuickRegistrationLinkProps {
  profile: any;
}

export function QuickRegistrationLink({
  profile,
}: QuickRegistrationLinkProps) {
  const [isCopied, setIsCopied] = useState(false);

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
    openBrowserLink(url);
  };

  return (
    <Card className="rounded-2xl shadow-sm transition-all duration-300 bg-white border-blue-100 shadow-blue-50/50 overflow-hidden">
      <CardContent className="p-5 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left w-full md:w-auto relative">
            <div className="relative shrink-0">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shadow-sm transition-transform duration-300 hover:rotate-6`}
              >
                <LinkIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h3 className={`text-base font-bold leading-tight text-[#1a3a5c] font-headline`}>
                  Link de Cadastro Rápido
                </h3>
              </div>
              <p className={`text-xs mt-1 max-w-md text-slate-500 font-medium`}>
                Envie aos pais para receber novos cadastros automaticamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="flex-1 md:flex-none font-bold border-green-100 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all rounded-xl h-10 px-4"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className={`flex-1 md:flex-none font-bold border-blue-100 text-[#1a3a5c] hover:bg-blue-50 hover:text-[#1a3a5c] transition-all rounded-xl h-10 px-4 ${isCopied
                ? "bg-green-50 text-green-700 border-green-200"
                : ""
                }`}
            >
              {isCopied ? (
                <>
                  <CopyCheck className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
