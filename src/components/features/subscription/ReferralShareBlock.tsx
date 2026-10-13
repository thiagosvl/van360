import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { openBrowserLink, copyToClipboard } from "@/utils/browser";
import { buildReferralShareMessage, buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { cn } from "@/lib/utils";
import { useActivityTracker } from "@/hooks/business/useActivityTracker";
import { AtividadeAcao } from "@/types/enums";

interface ReferralShareBlockProps {
  referralLink?: string;
  variant?: "default" | "compact";
  darkTheme?: boolean;
}

export function ReferralShareBlock({ referralLink, variant = "default", darkTheme = false }: ReferralShareBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const { trackActivity } = useActivityTracker();

  const handleCopyReferral = async () => {
    if (isCopying || isCopied) return;
    if (!referralLink) return;

    setIsCopying(true);
    trackActivity(AtividadeAcao.LINK_INDICACAO_COPIADO, {
      descricao: "Link de indicação copiado para a área de transferência.",
      meta: { referralLink },
    });

    try {
      const success = await copyToClipboard(referralLink);
      if (success) {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (isSharingWhatsApp) return;
    if (!referralLink) {
      handleCopyReferral();
      return;
    }

    setIsSharingWhatsApp(true);
    trackActivity(AtividadeAcao.LINK_INDICACAO_COMPARTILHADO, {
      descricao: "Link de indicação compartilhado via WhatsApp.",
      meta: { referralLink },
    });

    try {
      const message = buildReferralShareMessage(referralLink);
      const url = buildWhatsAppUrl(null, message);
      openBrowserLink(url);
    } finally {
      setTimeout(() => {
        setIsSharingWhatsApp(false);
      }, 1000);
    }
  };

  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="flex w-full gap-2 mt-1">
        <Button
          variant="outline"
          onClick={handleCopyReferral}
          disabled={isCopying || isCopied}
          className={cn(
            "flex-1 transition-all rounded-[18px] h-10 px-3 text-xs font-medium whitespace-nowrap border active:scale-95 cursor-pointer shadow-xs",
            darkTheme
              ? "bg-white text-[#0b1a2e] hover:bg-[#f5f5f5] border-white/20"
              : "bg-white text-[#0a0a0a] border-[#e5e5e5] hover:bg-[#fafafa]",
            isCopied && "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed pointer-events-none",
            isCopying && "opacity-75 cursor-not-allowed pointer-events-none"
          )}
        >
          {isCopying ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-[#737373]" />
              Copiando...
            </>
          ) : isCopied ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-emerald-700" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className={cn("w-4 h-4 mr-1.5", darkTheme ? "text-[#0b1a2e]" : "text-[#737373]")} />
              Copiar
            </>
          )}
        </Button>
        <Button
          onClick={handleShareWhatsApp}
          disabled={isSharingWhatsApp}
          className={cn(
            "flex-1 rounded-[18px] font-medium shadow-xs flex items-center justify-center transition-all h-10 text-xs whitespace-nowrap px-3 cursor-pointer active:scale-95",
            darkTheme
              ? "bg-white text-[#0b1a2e] hover:bg-[#f5f5f5]"
              : "bg-[#25D366] hover:bg-[#20ba59] text-white",
            isSharingWhatsApp && "opacity-75 cursor-not-allowed pointer-events-none"
          )}
        >
          {isSharingWhatsApp ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Abrindo...
            </>
          ) : (
            <>
              <WhatsAppIcon className={cn("w-3.5 h-3.5 mr-1.5", darkTheme ? "text-[#0b1a2e]" : "")} />
              Indicar no WhatsApp
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full text-left mb-3">
        <label className="text-xs font-medium text-[#737373] block mb-1.5 px-0.5">
          Seu link de indicação
        </label>
        <div className="flex items-center w-full border border-[#e5e5e5] rounded-[18px] bg-[#f5f5f5] shadow-xs p-1.5 pl-3.5">
          <span className="text-[#171717] truncate flex-1 min-w-0 font-medium text-xs sm:text-[13px] mr-2 select-all">
            {referralLink || "Gerando link..."}
          </span>
          <button
            onClick={handleCopyReferral}
            disabled={isCopying || isCopied}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-[14px] transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer select-none",
              isCopied
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none cursor-not-allowed pointer-events-none"
                : isCopying
                ? "bg-white text-[#737373] border border-[#e5e5e5] opacity-75 cursor-not-allowed pointer-events-none"
                : "bg-white text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa] shadow-2xs"
            )}
          >
            {isCopying ? (
              <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#737373]" />
                <span>Copiando...</span>
              </>
            ) : isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 shrink-0 text-[#737373]" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Button
        onClick={handleShareWhatsApp}
        disabled={isSharingWhatsApp}
        className={cn(
          "w-full bg-[#25D366] hover:bg-[#20ba59] text-white rounded-[18px] font-medium shadow-xs flex items-center justify-center transition-all h-10 text-xs sm:text-sm gap-2 cursor-pointer active:scale-95",
          isSharingWhatsApp && "opacity-75 cursor-not-allowed pointer-events-none"
        )}
      >
        {isSharingWhatsApp ? (
          <>
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            <span>Abrindo...</span>
          </>
        ) : (
          <>
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Indicar pelo WhatsApp</span>
          </>
        )}
      </Button>
    </>
  );
}
