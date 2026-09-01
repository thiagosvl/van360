import { Star } from "lucide-react";
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
      <div className={cn("bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 relative w-full space-y-4", className)}>
        <div className="flex flex-col items-center text-center">
          <div className="w-[48px] h-[48px] rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0 mb-3">
            <div className="bg-[#b45309] rounded-full p-1.5 flex items-center justify-center">
              <Star className="w-[16px] h-[16px] text-white fill-white" strokeWidth={1} />
            </div>
          </div>
          <h3 className="text-[18px] font-black text-[#d97706] leading-tight tracking-tight font-headline">
            Ganhe {bonusDaysPerReferral} dias grátis
          </h3>
          <p className="text-[12px] sm:text-[13px] text-slate-500 leading-snug mt-1.5 max-w-xs">
            Convide outros motoristas. Eles ganham desconto e você ganha +1 mês grátis!
          </p>
        </div>

        <div className="flex justify-center">
          <ReferralHowItWorksDrawer
            bonusDaysPerReferral={bonusDaysPerReferral}
            triggerClassName="flex items-center justify-center text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-slate-100 rounded-2xl py-2.5 px-3 flex flex-col items-center justify-center bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Indicações</span>
            <span className="text-xl font-bold text-[#1e3a8a]">{completedReferrals}</span>
          </div>
          <div className="border border-slate-100 rounded-2xl py-2.5 px-3 flex flex-col items-center justify-center bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Dias Ganhos</span>
            <span className="text-xl font-bold text-[#d97706]">{totalBonusDays}</span>
          </div>
        </div>

        <div className="bg-slate-50/60 p-3.5 sm:p-4 rounded-2xl border border-slate-100/80">
          <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 relative w-full", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 mb-3">
            <div className="w-[48px] h-[48px] rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0">
              <div className="bg-[#b45309] rounded-full p-1.5 flex items-center justify-center">
                <Star className="w-[16px] h-[16px] text-white fill-white" strokeWidth={1} />
              </div>
            </div>
            <div>
              <h3 className="text-[18px] sm:text-[20px] font-black text-[#d97706] leading-tight tracking-tight font-headline">
                Ganhe {bonusDaysPerReferral} dias grátis
              </h3>
              <p className="text-[12px] sm:text-[13px] text-slate-500 leading-snug mt-1">
                Convide outros motoristas. Eles ganham desconto e você ganha +1 mês grátis!
              </p>
            </div>
          </div>

          <ReferralHowItWorksDrawer
            bonusDaysPerReferral={bonusDaysPerReferral}
            triggerClassName="flex items-center justify-center text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full mb-4 cursor-pointer"
          />

          <div className="flex w-full gap-3">
            <div className="flex-1 border border-slate-100 rounded-2xl py-2.5 px-3 flex flex-col items-center lg:items-start justify-center bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Indicações</span>
              <span className="text-xl font-bold text-[#1e3a8a]">{completedReferrals}</span>
            </div>
            <div className="flex-1 border border-slate-100 rounded-2xl py-2.5 px-3 flex flex-col items-center lg:items-start justify-center bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Dias Ganhos</span>
              <span className="text-xl font-bold text-[#d97706]">{totalBonusDays}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80">
          <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
        </div>
      </div>
    </div>
  );
}
