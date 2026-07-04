import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { openBrowserLink } from "@/utils/browser";
import { toast } from "sonner";

interface ReferralShareBlockProps {
  referralLink?: string;
  variant?: "default" | "compact";
}

export function ReferralShareBlock({ referralLink, variant = "default" }: ReferralShareBlockProps) {
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

  return (
    <>
      <div className={`w-full text-left ${isCompact ? "mb-3" : "mb-4"}`}>
        {!isCompact && (
          <label className="text-[12px] font-bold text-slate-800 block mb-2 px-1">
            Seu link de convite
          </label>
        )}
        <div className={`flex items-center w-full border border-slate-200 rounded-xl bg-white shadow-sm ${isCompact ? "px-2.5 py-2" : "px-3 py-2"}`}>
          <span className={`text-slate-600 truncate flex-1 font-medium ${isCompact ? "text-[12px]" : "text-[13px]"}`}>
            {referralLink || "Gerando link..."}
          </span>
          <button
            onClick={handleCopyReferral}
            className="ml-2 text-slate-500 hover:text-slate-800 transition-colors p-1"
          >
            {isCopied ? (
              <CheckCircle2 className={`text-emerald-500 ${isCompact ? "w-[16px] h-[16px]" : "w-[18px] h-[18px]"}`} />
            ) : (
              <Copy className={isCompact ? "w-[16px] h-[16px]" : "w-[18px] h-[18px]"} />
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
        className={`w-full bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl font-bold shadow-sm flex items-center justify-center transition-all ${isCompact ? "h-11 text-[13px] gap-1.5" : "h-12 text-[14px] gap-2"
          }`}
      >
        <WhatsAppIcon className={isCompact ? "w-4 h-4" : "w-[18px] h-[18px]"} />
        {isCompact ? "Convidar" : "Convidar pelo WhatsApp"}
      </Button>
    </>
  );
}
