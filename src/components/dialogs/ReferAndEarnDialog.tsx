import { Gift, Star } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "@/components/features/subscription/ReferralShareBlock";
import { ReferralHowItWorksDrawer } from "@/components/features/subscription/ReferralHowItWorksDrawer";

interface ReferAndEarnDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferAndEarnDialog({ isOpen, onClose }: ReferAndEarnDialogProps) {
  const { user } = useSession();
  const { referral } = useSubscriptionReferral(user?.id);

  const bonusDaysPerReferral = referral?.bonusDays ?? 30;
  const completedReferrals = referral?.completed ?? 0;
  const earnedBonusDays = completedReferrals * bonusDaysPerReferral;

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      description="Programa de indicação Van360"
    >
      <BaseDialog.Header
        title="Indique e Ganhe"
        icon={<Gift className="h-5 w-5 text-amber-500" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-4 pt-2">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#fff7ed] flex items-center justify-center mb-3">
            <div className="bg-[#b45309] rounded-full p-1.5 flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" strokeWidth={1} />
            </div>
          </div>

          <h4 className="text-xl font-bold text-[#f59e0b] mb-1 tracking-tight">
            Ganhe {bonusDaysPerReferral} dias grátis
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed px-2 mb-3">
            Convide outros motoristas. Eles ganham desconto e você ganha +1 mês grátis!
          </p>

          <ReferralHowItWorksDrawer bonusDaysPerReferral={bonusDaysPerReferral} />

          <div className="flex w-full gap-3 mb-4">
            <div className="flex-1 border border-slate-100 shadow-xs rounded-xl py-2.5 flex flex-col items-center justify-center bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Indicações</span>
              <span className="text-lg font-bold text-[#1e3a8a]">{completedReferrals}</span>
            </div>
            <div className="flex-1 border border-slate-100 shadow-xs rounded-xl py-2.5 flex flex-col items-center justify-center bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Dias Ganhos</span>
              <span className="text-lg font-bold text-amber-500">{earnedBonusDays} dias</span>
            </div>
          </div>

          <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default ReferAndEarnDialog;
