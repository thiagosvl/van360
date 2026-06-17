import { useState } from "react";
import { Copy, CheckCircle2, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { openBrowserLink } from "@/utils/browser";
import { phoneMask } from "@/utils/masks";
import { toast } from "sonner";
import { useSession } from "@/hooks/business/useSession";

interface ReferAndEarnCardProps {
  isTrial: boolean;
}

export function ReferAndEarnCard({ isTrial }: ReferAndEarnCardProps) {
  const { user } = useSession();
  const { referral, claimReferral } = useSubscriptionReferral(user?.id);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");

  const handleCopyReferral = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
      setIsCopied(true);
      toast.success("Link de indicação copiado!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClaimReferral = async () => {
    const cleanedPhone = claimPhone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      toast.error("Informe um número de WhatsApp válido (com DDD).");
      return;
    }
    try {
      await claimReferral.mutateAsync(cleanedPhone);
      toast.success("Indicação vinculada com sucesso!");
      setClaimPhone("");
      setIsClaimOpen(false);
    } catch {
      toast.error("Motorista não encontrado com esse número.");
    }
  };

  const bonusDaysPerReferral = referral?.bonusDays || 0;
  const completedReferrals = referral?.completed || 0;
  const totalBonusDays = (completedReferrals * bonusDaysPerReferral) || 0;

  return (
    <div className="bg-white border border-slate-100 rounded-[22px] p-6 lg:p-8 text-primary shadow-sm relative overflow-hidden">
      <div className="relative z-10 space-y-3 lg:space-y-8">
        <div className="space-y-3">
          <p className="font-normal text-sm sm:text-base text-primary">
            Convide colegas e <span className="text-primary font-black"> ganhe mensalidades grátis</span>
          </p>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            A cada motorista indicado que assinar o Van360, você ganha {bonusDaysPerReferral} dias grátis.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around bg-slate-50 p-5 rounded-[22px] border border-slate-100 shadow-sm">
          <div className="text-center w-full">
            <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Indicações</p>
            <p className="text-2xl font-semibold text-primary">{completedReferrals}</p>
          </div>

          <div className="w-px h-10 bg-slate-200 shrink-0 mx-2"></div>

          <div className="text-center w-full">
            <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Dias Ganhos</p>
            <p className="text-2xl font-semibold text-primary">{totalBonusDays} dias</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Seu Link de Convite</Label>
            <div className="flex gap-2">
              <div className="bg-slate-50 flex-1 px-4 py-3 rounded-xl text-[11px] font-medium truncate text-slate-600 border border-slate-100 shadow-sm leading-none flex items-center">
                {referral?.referralLink || "Gerando link..."}
              </div>
              <button
                onClick={handleCopyReferral}
                className="bg-primary text-white p-3 rounded-xl active:scale-90 transition-transform shadow-md shrink-0"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={() => {
              if (referral?.referralLink) {
                const shareText = encodeURIComponent(`Use meu link para se cadastrar no Van360 e ganhe desconto na assinatura! ${referral.referralLink}`);
                openBrowserLink(`https://wa.me/?text=${shareText}`);
              } else {
                handleCopyReferral();
              }
            }}
            className="w-full sm:hidden h-12 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-[11px] font-headline uppercase tracking-widest shadow-md shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
          >
            <WhatsAppIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Compartilhar Link
          </Button>
        </div>

        {isTrial && !referral?.hasIndicator && (
          <div className="pt-6 border-t border-slate-100 text-center">
            {!isClaimOpen ? (
              <button
                onClick={() => setIsClaimOpen(true)}
                className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Award className="w-4 h-4" />
                Ganhei um convite
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <Input
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(phoneMask(e.target.value))}
                  placeholder="WhatsApp de quem indicou"
                  className="bg-slate-50 border-slate-100 text-slate-700 placeholder:text-slate-400 h-11 rounded-xl text-xs px-4 focus:ring-primary/20 shadow-sm"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-11 bg-primary text-white font-black text-[11px] font-headline uppercase rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20"
                    onClick={handleClaimReferral}
                    disabled={claimReferral.isPending}
                  >
                    {claimReferral.isPending ? "Processando..." : "Utilizar o Bônus"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-11 h-11 text-slate-400 hover:bg-slate-100 hover:text-rose-500 p-0 rounded-xl transition-colors"
                    onClick={() => setIsClaimOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
