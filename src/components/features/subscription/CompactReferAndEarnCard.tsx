import { Star } from "lucide-react";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "./ReferralShareBlock";

export function CompactReferAndEarnCard() {
  const { user } = useSession();
  const { referral } = useSubscriptionReferral(user?.id);

  const bonusDaysPerReferral = referral?.bonusDays || 30;

  return (
    <div className="bg-white rounded-[20px] p-4 md:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative w-full mt-2 mb-2 md:mb-0">
      <div className="flex flex-col items-center text-center">
        {/* Icon & Title */}
        <div className="flex items-center justify-center gap-2 mb-1.5 w-full">
          <div className="w-[32px] h-[32px] rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0">
            <div className="bg-[#b45309] rounded-full p-1 flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" strokeWidth={1} />
            </div>
          </div>
          <h4 className="text-[17px] font-bold text-[#f59e0b] tracking-tight leading-none mt-0.5">
            Ganhe {bonusDaysPerReferral} dias grátis
          </h4>
        </div>
        <p className="text-[12px] text-slate-500 leading-snug px-2 mb-4">
          Quer ganhar mensalidade grátis? Indique para um colega.
        </p>

        {/* Share Block */}
        <ReferralShareBlock referralLink={referral?.referralLink} variant="compact" />
      </div>
    </div>
  );
}
