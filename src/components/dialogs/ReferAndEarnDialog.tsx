import { useState } from "react";
import { Gift, Award, X, HelpCircle, Star } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscriptionReferral, useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { SubscriptionStatus } from "@/types/enums";
import { phoneMask } from "@/utils/masks";
import { toast } from "sonner";
import { useSession } from "@/hooks/business/useSession";
import { ReferralShareBlock } from "@/components/features/subscription/ReferralShareBlock";
import { ReferralHowItWorksDrawer } from "@/components/features/subscription/ReferralHowItWorksDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ReferAndEarnDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferAndEarnDialog({ isOpen, onClose }: ReferAndEarnDialogProps) {
  const { user } = useSession();
  const { referral, claimReferral } = useSubscriptionReferral(user?.id);
  const { subscription } = useSubscriptionStatus(user?.id);

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");

  const isTrial = subscription?.status === SubscriptionStatus.TRIAL;

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
  const totalBonusDays = completedReferrals * bonusDaysPerReferral;

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
              <span className="text-lg font-bold text-[#1e3a8a]">{totalBonusDays}</span>
            </div>
          </div>

          <ReferralShareBlock referralLink={referral?.referralLink} variant="default" />

          {isTrial && !referral?.hasIndicator && (
            <div className="w-full mt-4 pt-3 border-t border-slate-100">
              {!isClaimOpen ? (
                <button
                  onClick={() => setIsClaimOpen(true)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 w-full"
                >
                  <Award className="w-4 h-4" />
                  Fui Convidado
                </button>
              ) : (
                <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <Input
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(phoneMask(e.target.value))}
                    placeholder="WhatsApp de quem indicou"
                    className="bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 h-10 rounded-xl text-xs px-3 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-10 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90"
                      onClick={handleClaimReferral}
                      disabled={claimReferral.isPending}
                    >
                      {claimReferral.isPending ? "Processando..." : "Utilizar o Bônus"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-10 h-10 text-slate-400 hover:bg-slate-100 hover:text-rose-500 p-0 rounded-xl shrink-0"
                      onClick={() => setIsClaimOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default ReferAndEarnDialog;
