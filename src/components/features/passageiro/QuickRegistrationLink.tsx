import { Button } from "@/components/ui/button";
import { openBrowserLink } from "@/utils/browser";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { toast } from "@/utils/notifications/toast";
import {
  Check,
  Copy,
  Smartphone,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";

interface QuickRegistrationLinkProps {
  profile: any;
  pendingCount?: number;
}

export function QuickRegistrationLink({
  profile,
  pendingCount = 0,
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
    <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-emerald-900">Deixe os pais preencherem a ficha!</p>
          <p className="text-[11px] text-emerald-700">
            Envie este link para os responsáveis. Eles preenchem a ficha e os dados caem prontos no seu aplicativo.
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 w-full lg:w-auto shrink-0">
        <button
          onClick={handleShareWhatsApp}
          className="h-11 px-4 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700/90 transition-all shadow-sm shadow-emerald-200/50 flex-1 lg:flex-none flex justify-center items-center gap-2 active:scale-95"
        >
          <WhatsAppIcon className="h-4 w-4 fill-current" />
          WhatsApp
        </button>
        <button
          onClick={handleCopyLink}
          className={cn(
            "h-11 px-4 text-[13px] font-bold rounded-xl transition-all shadow-sm flex-1 lg:flex-none flex justify-center items-center gap-2 active:scale-95",
            isCopied 
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          )}
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {isCopied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
