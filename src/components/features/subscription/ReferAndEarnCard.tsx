import { useState } from "react";
import { Copy, CheckCircle2, Award, X, HelpCircle, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { openBrowserLink } from "@/utils/browser";
import { phoneMask } from "@/utils/masks";
import { toast } from "sonner";
import { useSession } from "@/hooks/business/useSession";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
      toast.success("Link copiado!");
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

  const bonusDaysPerReferral = referral?.bonusDays || 30;
  const completedReferrals = referral?.completed || 0;
  const totalBonusDays = (completedReferrals * bonusDaysPerReferral) || 0;

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative w-full">
      {/* Main Content */}
      <div className="flex flex-col items-center text-center">
        {/* Star Icon */}
        <div className="w-[52px] h-[52px] rounded-full bg-[#fff7ed] flex items-center justify-center mb-4">
          <div className="bg-[#b45309] rounded-full p-1.5 flex items-center justify-center">
            <Star className="w-[18px] h-[18px] text-white fill-white" strokeWidth={1} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h4 className="text-[22px] font-bold text-[#f59e0b] mb-2 tracking-tight">
          Ganhe {bonusDaysPerReferral} dias grátis
        </h4>
        <p className="text-[13px] text-slate-500 leading-snug px-4 mb-4">
          Convide outros motoristas. Eles ganham desconto e você ganha mensalidades grátis!
        </p>

        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex items-center justify-center text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full mb-6 mx-auto">
              <HelpCircle className="w-4 h-4 mr-1.5" strokeWidth={2} />
              Como funciona?
            </button>
          </DrawerTrigger>
          <DrawerContent className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl overflow-hidden">
            <DrawerHeader className="text-left px-8 pt-6 pb-2">
              <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">
                Como funciona o Indique e Ganhe?
              </DrawerTitle>
              <DrawerDescription className="text-sm font-medium text-slate-500 mt-3 text-left">
                <ul className="space-y-4 list-decimal pl-5">
                  <li><strong>Compartilhe:</strong> Envie seu link exclusivo para outros colegas motoristas.</li>
                  <li><strong>Vantagem Dupla:</strong> O motorista que você indicou ganha um <strong>desconto especial</strong> ao assinar o Van360.</li>
                  <li><strong>Sua Recompensa:</strong> Assim que a assinatura dele for ativada, você ganha <strong>{bonusDaysPerReferral} dias grátis</strong> na sua mensalidade!</li>
                  <li><strong>Sem Limites:</strong> Não há limite de indicações. Sempre que alguém assinar pelo seu link, você acumula mais 1 mês grátis!</li>
                </ul>
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-8 pb-8 pt-4">
              <DrawerTrigger asChild>
                <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold">
                  Entendi
                </Button>
              </DrawerTrigger>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Stats Row */}
        <div className="flex w-full gap-3 mb-6">
          <div className="flex-1 border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center bg-white">
            <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Indicações</span>
            <span className="text-[20px] font-bold text-[#1e3a8a]">{completedReferrals}</span>
          </div>
          <div className="flex-1 border border-slate-100 shadow-sm rounded-xl py-3 flex flex-col items-center justify-center bg-white">
            <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Dias Ganhos</span>
            <span className="text-[20px] font-bold text-[#1e3a8a]">{totalBonusDays}</span>
          </div>
        </div>

        {/* Link Section */}
        <div className="w-full text-left mb-4">
          <label className="text-[12px] font-bold text-slate-800 block mb-2 px-1">
            Seu link de convite
          </label>
          <div className="flex items-center w-full border border-slate-200 rounded-xl px-3 py-2 bg-white shadow-sm">
            <span className="text-[13px] text-slate-600 truncate flex-1 font-medium">
              {referral?.referralLink || "Gerando link..."}
            </span>
            <button
              onClick={handleCopyReferral}
              className="ml-2 text-slate-500 hover:text-slate-800 transition-colors p-1"
            >
              {isCopied ? <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" /> : <Copy className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* WhatsApp Button */}
        <Button
          onClick={() => {
            if (referral?.referralLink) {
              const shareText = encodeURIComponent(`Use meu link para se cadastrar no Van360 e ganhe desconto na assinatura! ${referral.referralLink}`);
              openBrowserLink(`https://wa.me/?text=${shareText}`);
            } else {
              handleCopyReferral();
            }
          }}
          className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl font-bold text-[14px] shadow-sm flex items-center justify-center gap-2 transition-all"
        >
          <WhatsAppIcon className="w-[18px] h-[18px]" />
          Compartilhar no WhatsApp
        </Button>

        {/* Claim Invite logic for trial users */}
        {isTrial && !referral?.hasIndicator && (
          <div className="w-full mt-6 pt-5 border-t border-slate-100">
            {!isClaimOpen ? (
              <button
                onClick={() => setIsClaimOpen(true)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 w-full"
              >
                <Award className="w-3.5 h-3.5" />
                Fui Convidado
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
                    className="flex-1 h-11 bg-primary text-white font-bold text-[11px] font-headline uppercase rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20"
                    onClick={handleClaimReferral}
                    disabled={claimReferral.isPending}
                  >
                    {claimReferral.isPending ? "Processando..." : "Utilizar o Bônus"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-11 h-11 text-slate-400 hover:bg-slate-100 hover:text-rose-500 p-0 rounded-xl transition-colors shrink-0"
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
