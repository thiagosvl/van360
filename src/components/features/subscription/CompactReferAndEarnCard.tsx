import { Star } from "lucide-react";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "./ReferralShareBlock";

export function CompactReferAndEarnCard() {
  const { user } = useSession();
  const { referral } = useSubscriptionReferral(user?.id);

  const bonusDaysPerReferral = referral?.bonusDays || 30;

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative w-full mt-4">
      <div className="flex flex-col items-center text-center">
        {/* Star Icon */}
        <div className="w-[42px] h-[42px] rounded-full bg-[#fff7ed] flex items-center justify-center mb-3">
          <div className="bg-[#b45309] rounded-full p-1.5 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white fill-white" strokeWidth={1} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h4 className="text-[17px] font-bold text-[#f59e0b] mb-1.5 tracking-tight">
          Ganhe {bonusDaysPerReferral} dias grátis
        </h4>
        <p className="text-[12px] text-slate-500 leading-snug px-2 mb-4">
          Quer ganhar mensalidade grátis? Indique para um colega.
        </p>

        {/* Share Block */}
        <ReferralShareBlock referralLink={referral?.referralLink} variant="compact" />
      </div>
    </div>
  );
}
