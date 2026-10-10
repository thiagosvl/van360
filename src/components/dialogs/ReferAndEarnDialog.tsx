import { Gift } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useSubscriptionReferral } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "@/components/features/subscription/ReferralShareBlock";
import { ReferralHowItWorksDrawer } from "@/components/features/subscription/ReferralHowItWorksDrawer";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

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

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      description="Programa de indicação Van360"
    >
      <BaseDialog.Header
        title="Indique e Ganhe"
        icon={<Gift className="h-5 w-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-4 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-[14px] bg-primary/10 border border-primary/15 flex items-center justify-center mb-3 text-primary">
            <Gift className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>

          <h4 className="text-xl font-semibold text-[#0a0a0a] mb-1 tracking-tight font-headline">
            Ganhe {bonusDaysPerReferral} dias grátis
          </h4>
          <p className="text-xs text-[#737373] leading-relaxed px-2 mb-3">
            Convide outros motoristas. Eles ganham desconto e você ganha +1 mês grátis!
          </p>

          <div className="mb-4">
            <ReferralHowItWorksDrawer bonusDaysPerReferral={bonusDaysPerReferral} />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            <div className="border border-[#e5e5e5] rounded-[16px] py-2.5 px-3 flex flex-col items-center justify-center bg-[#fafafa]">
              <span className="text-[11px] font-medium text-[#737373] mb-0.5 uppercase tracking-wider">Indicações</span>
              <span className="text-xl font-semibold text-[#0a0a0a]">{completedReferrals}</span>
            </div>
            <div className="border border-[#e5e5e5] rounded-[16px] py-2.5 px-3 flex flex-col items-center justify-center bg-[#fafafa]">
              <span className="text-[11px] font-medium text-[#737373] mb-0.5 uppercase tracking-wider">Dias Ganhos</span>
              <span className="text-xl font-semibold text-primary">{earnedBonusDays} dias</span>
            </div>
          </div>

          <div className="w-full bg-[#fafafa] p-3.5 sm:p-4 rounded-[18px] border border-[#e5e5e5]">
            <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />
          </div>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default ReferAndEarnDialog;
