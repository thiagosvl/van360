import { Star } from "lucide-react";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "./ReferralShareBlock";
import { ReferralHowItWorksDrawer } from "./ReferralHowItWorksDrawer";

export function ReferAndEarnCard() {
  const { user } = useSession();
  const { referral } = useSubscriptionReferral(user?.id);

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
        <h3 className="text-[20px] font-black text-[#d97706] mb-1 tracking-tight font-headline">
          Ganhe {bonusDaysPerReferral} dias grátis
        </h3>
        <p className="text-[13px] text-slate-500 leading-snug px-4 mb-4">
          Convide outros motoristas. Eles ganham desconto e você ganha +1 mês gratis!
        </p>

        <ReferralHowItWorksDrawer
          bonusDaysPerReferral={bonusDaysPerReferral}
          triggerClassName="flex items-center justify-center text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full mb-6 mx-auto"
        />

        {/* Stats Row */}
        <div className="flex w-full gap-3 mb-6">
          <div className="flex-1 border border-slate-100 rounded-2xl py-3 flex flex-col items-center justify-center bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Indicações</span>
            <span className="text-xl font-bold text-[#1e3a8a]">{completedReferrals}</span>
          </div>
          <div className="flex-1 border border-slate-100 rounded-2xl py-3 flex flex-col items-center justify-center bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Dias Ganhos</span>
            <span className="text-xl font-bold text-[#d97706]">{totalBonusDays}</span>
          </div>
        </div>

        {/* Share Block */}
        <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
      </div>
    </div>
  );
}
