import { Gift } from "lucide-react";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "./ReferralShareBlock";
import { ReferralHowItWorksDrawer } from "./ReferralHowItWorksDrawer";
import { cn } from "@/lib/utils";

interface ReferAndEarnCardProps {
  layout?: "auto" | "vertical" | "horizontal";
  className?: string;
}

export function ReferAndEarnCard({ layout = "auto", className }: ReferAndEarnCardProps) {
  const { user } = useSession();
  const { referral } = useSubscriptionReferral(user?.id);

  const bonusDaysPerReferral = referral?.bonusDays || 30;
  const completedReferrals = referral?.completed || 0;
  const totalBonusDays = (completedReferrals * bonusDaysPerReferral) || 0;

  if (layout === "vertical") {
    return (
      <div className={cn("bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-[#e5e5e5] relative w-full space-y-4", className)}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-[14px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mb-3 text-primary">
            <Gift className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-[#0a0a0a] leading-tight tracking-tight font-headline">
            Ganhe {bonusDaysPerReferral} dias grátis
          </h3>
          <p className="text-xs sm:text-[13px] text-[#737373] leading-snug mt-1.5 max-w-xs">
            Convide outros motoristas. Eles ganham desconto e você ganha +1 mês grátis!
          </p>
        </div>

        <div className="flex justify-center">
          <ReferralHowItWorksDrawer bonusDaysPerReferral={bonusDaysPerReferral} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[#e5e5e5] rounded-[16px] py-2.5 px-3 flex flex-col items-center justify-center bg-[#fafafa]">
            <span className="text-[11px] font-medium text-[#737373] mb-0.5 uppercase tracking-wider">Indicações</span>
            <span className="text-xl font-semibold text-[#0a0a0a]">{completedReferrals}</span>
          </div>
          <div className="border border-[#e5e5e5] rounded-[16px] py-2.5 px-3 flex flex-col items-center justify-center bg-[#fafafa]">
            <span className="text-[11px] font-medium text-[#737373] mb-0.5 uppercase tracking-wider">Dias Ganhos</span>
            <span className="text-xl font-semibold text-[#0a0a0a]">{totalBonusDays}</span>
          </div>
        </div>

        <div className="w-full bg-[#fafafa] p-3.5 sm:p-4 rounded-[18px] border border-[#e5e5e5]">
          <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-[#e5e5e5] relative w-full", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between items-center sm:items-start text-center sm:text-left h-full">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-2">
              <div className="w-12 h-12 rounded-[14px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary">
                <Gift className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] leading-tight tracking-tight font-headline">
                    Ganhe {bonusDaysPerReferral} dias grátis
                  </h3>
                  <div className="hidden sm:inline-flex">
                    <ReferralHowItWorksDrawer bonusDaysPerReferral={bonusDaysPerReferral} />
                  </div>
                </div>
                <p className="text-xs sm:text-[13px] text-[#737373] leading-snug mt-1.5">
                  Convide outros motoristas. Eles ganham desconto e você ganha +1 mês grátis!
                </p>
                <div className="sm:hidden pt-3 flex justify-center">
                  <ReferralHowItWorksDrawer bonusDaysPerReferral={bonusDaysPerReferral} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4 lg:mt-6">
            <div className="border border-[#e5e5e5] rounded-[16px] py-2.5 px-3.5 flex flex-col items-center sm:items-start justify-center bg-[#fafafa]">
              <span className="text-[11px] font-medium text-[#737373] mb-0.5 uppercase tracking-wider">Indicações</span>
              <span className="text-xl font-semibold text-[#0a0a0a]">{completedReferrals}</span>
            </div>
            <div className="border border-[#e5e5e5] rounded-[16px] py-2.5 px-3.5 flex flex-col items-center sm:items-start justify-center bg-[#fafafa]">
              <span className="text-[11px] font-medium text-[#737373] mb-0.5 uppercase tracking-wider">Dias Ganhos</span>
              <span className="text-xl font-semibold text-[#0a0a0a]">{totalBonusDays}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center w-full h-full bg-[#fafafa] p-4 sm:p-5 rounded-[20px] border border-[#e5e5e5]">
          <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
        </div>
      </div>
    </div>
  );
}
