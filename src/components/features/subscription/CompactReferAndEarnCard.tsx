import { Star } from "lucide-react";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "./ReferralShareBlock";
import { cn } from "@/lib/utils";

interface CompactReferAndEarnCardProps {}

export function CompactReferAndEarnCard({}: CompactReferAndEarnCardProps = {}) {
  const { user } = useSession();
  const { referral } = useSubscriptionReferral(user?.id);

  const bonusDaysPerReferral = referral?.bonusDays || 30;

  return (
    <div className={cn(
      "rounded-2xl p-3.5 border flex flex-col relative w-full mt-3 mb-1 md:mb-0",
      "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/25 shadow-xs"
    )}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2 mb-1.5 w-full">
          <div className="w-[28px] h-[28px] rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0">
            <div className="bg-[#b45309] rounded-full p-0.5 flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-white fill-white" strokeWidth={1} />
            </div>
          </div>
          <h4 className={cn(
            "text-[15px] font-bold tracking-tight leading-none mt-0.5",
            "text-white"
          )}>
            Indique e Ganhe <span className="text-[#f59e0b]">{bonusDaysPerReferral} dias grátis</span>
          </h4>
        </div>

        {/* Share Block */}
        <ReferralShareBlock referralLink={referral?.referralLink} variant="compact" darkTheme={true} />
      </div>
    </div>
  );
}
