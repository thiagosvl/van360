import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { openBrowserLink } from "@/utils/browser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReferralShareBlockProps {
  referralLink?: string;
  variant?: "default" | "compact";
  darkTheme?: boolean;
}

export function ReferralShareBlock({ referralLink, variant = "default", darkTheme = false }: ReferralShareBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="flex flex-wrap w-full gap-2 mt-1">
        <Button
          variant="outline"
          onClick={handleCopyReferral}
          className={cn(
            "flex-1 min-w-[100px] transition-all rounded-xl h-10 px-2 text-[11px] sm:text-[12px] font-bold border",
            darkTheme 
              ? "bg-white text-[#0b1a2e] hover:bg-slate-100 border-white/20"
              : "border-[#1a3a5c]/10 text-[#1a3a5c] hover:bg-[#1a3a5c]/5 hover:text-[#1a3a5c]",
            isCopied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
          )}
        >
          {isCopied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className={cn("w-3.5 h-3.5 mr-1", darkTheme ? "text-[#0b1a2e]" : "text-slate-400")} />
              Copiar Link
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            if (referralLink) {
              const shareText = encodeURIComponent(`Use meu link para se cadastrar no Van360 e ganhe desconto na assinatura! ${referralLink}`);
              openBrowserLink(`https://wa.me/?text=${shareText}`);
            } else {
              handleCopyReferral();
            }
          }}
          className={cn(
            "flex-1 min-w-[100px] rounded-xl font-bold shadow-sm flex items-center justify-center transition-all h-10 text-[11px] sm:text-[12px] px-2",
            darkTheme
              ? "bg-white text-[#0b1a2e] hover:bg-slate-100"
              : "bg-[#25D366] hover:bg-[#20b858] text-white"
          )}
        >
          <WhatsAppIcon className={cn("w-3.5 h-3.5 mr-1", darkTheme ? "text-[#0b1a2e]" : "")} />
          Convidar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full text-left mb-4">
        <label className="text-[12px] font-bold text-slate-800 block mb-2 px-1">
          Seu link de convite
        </label>
        <div className="flex items-center w-full border border-slate-200 rounded-xl bg-white shadow-sm px-3 py-2">
          <span className="text-slate-600 truncate flex-1 font-medium text-[13px]">
            {referralLink || "Gerando link..."}
          </span>
          <button
            onClick={handleCopyReferral}
            className="ml-2 text-slate-500 hover:text-slate-800 transition-colors p-1"
          >
            {isCopied ? (
              <CheckCircle2 className="text-emerald-500 w-[18px] h-[18px]" />
            ) : (
              <Copy className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </div>

      <Button
        onClick={() => {
          if (referralLink) {
            const shareText = encodeURIComponent(`Use meu link para se cadastrar no Van360 e ganhe desconto na assinatura! ${referralLink}`);
            openBrowserLink(`https://wa.me/?text=${shareText}`);
          } else {
            handleCopyReferral();
          }
        }}
        className="w-full bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl font-bold shadow-sm flex items-center justify-center transition-all h-12 text-[14px] gap-2"
      >
        <WhatsAppIcon className="w-[18px] h-[18px]" />
        Convidar pelo WhatsApp
      </Button>
    </>
  );
}
