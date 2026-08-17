import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { openBrowserLink, copyToClipboard } from "@/utils/browser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReferralShareBlockProps {
  referralLink?: string;
  variant?: "default" | "compact";
  darkTheme?: boolean;
}

export function ReferralShareBlock({ referralLink, variant = "default", darkTheme = false }: ReferralShareBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyReferral = async () => {
    if (referralLink) {
      const success = await copyToClipboard(referralLink);
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    }
  };

  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="flex w-full gap-1.5 mt-1">
        <Button
          variant="outline"
          onClick={handleCopyReferral}
          className={cn(
            "flex-1 transition-all rounded-xl h-10 px-2 text-[11px] lg:text-[12px] whitespace-nowrap font-bold border active:scale-95 cursor-pointer",
            darkTheme
              ? "bg-white text-[#0b1a2e] hover:bg-slate-100 border-white/20"
              : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-xs",
            isCopied ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""
          )}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 mr-1 text-emerald-700" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className={cn("w-4 h-4 mr-1", darkTheme ? "text-[#0b1a2e]" : "text-emerald-700")} />
              Copiar Link
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            if (referralLink) {
              const shareText = encodeURIComponent(`Use meu link para se cadastrar no Van360 e ganhe desconto na assinatura! ${referralLink}`);
              openBrowserLink(`https://api.whatsapp.com/send?text=${shareText}`);
            } else {
              handleCopyReferral();
            }
          }}
          className={cn(
            "flex-1 rounded-xl font-bold shadow-sm flex items-center justify-center transition-all h-10 text-[10px] lg:text-[11px] whitespace-nowrap px-1 cursor-pointer active:scale-95",
            darkTheme
              ? "bg-white text-[#0b1a2e] hover:bg-slate-100"
              : "bg-[#25D366] hover:bg-[#20b858] text-white"
          )}
        >
          <WhatsAppIcon className={cn("w-3.5 h-3.5 mr-1", darkTheme ? "text-[#0b1a2e]" : "")} />
          Indicar no WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full text-left mb-3">
        <label className="text-[12px] font-bold text-slate-800 block mb-2 px-1">
          Seu link de indicação
        </label>
        <div className="flex items-center w-full border border-slate-200 rounded-xl bg-white shadow-sm p-1.5 pl-3">
          <span className="text-slate-600 truncate flex-1 font-medium text-[12px] sm:text-[13px] mr-2">
            {referralLink || "Gerando link..."}
          </span>
          <button
            onClick={handleCopyReferral}
            className={cn(
              "h-9 px-3.5 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer select-none",
              isCopied
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none"
                : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-xs"
            )}
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{isCopied ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
      </div>

      <Button
        onClick={() => {
          if (referralLink) {
            const shareText = encodeURIComponent(`Use meu link para se cadastrar no Van360 e ganhe desconto na assinatura! ${referralLink}`);
            openBrowserLink(`https://api.whatsapp.com/send?text=${shareText}`);
          } else {
            handleCopyReferral();
          }
        }}
        className="w-full bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl font-bold shadow-sm flex items-center justify-center transition-all h-11 text-[13px] gap-2 cursor-pointer active:scale-95"
      >
        <WhatsAppIcon className="w-4 h-4" />
        Indicar pelo WhatsApp
      </Button>
    </>
  );
}
