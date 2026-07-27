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
      "rounded-[20px] p-4 md:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border flex flex-col relative w-full mt-2 mb-2 md:mb-0",
      "bg-white/5 border-white/10"
    )}>
      <div className="flex flex-col items-center text-center">
        {/* Icon & Title */}
        <div className="flex items-center justify-center gap-2 mb-1.5 w-full">
          <div className="w-[32px] h-[32px] rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0">
            <div className="bg-[#b45309] rounded-full p-1 flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" strokeWidth={1} />
            </div>
          </div>
          <h4 className={cn(
            "text-[17px] font-bold tracking-tight leading-none mt-0.5 mb-2",
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
