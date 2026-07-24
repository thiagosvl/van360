import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useProfile } from "@/hooks/business/useProfile";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useContratosKPIs } from "@/hooks/api/useContratos";
import { SubscriptionStatus } from "@/types/enums";

export function useContractLimit() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { subscription } = useSubscriptionStatus(profile?.id);
  const { data: kpis } = useContratosKPIs();

  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);

  const isTrial = subscription?.status === SubscriptionStatus.TRIAL;
  const totalContratos = (kpis?.pendentes || 0) + (kpis?.assinados || 0);
  const TRIAL_LIMIT = 3;
  const isLimitReached = isTrial && totalContratos >= TRIAL_LIMIT;

  const checkCanCreateContract = useCallback((): boolean => {
    if (isLimitReached) {
      setIsLimitDialogOpen(true);
      return false;
    }
    return true;
  }, [isLimitReached]);

  const handleGoToSubscription = useCallback(() => {
    setIsLimitDialogOpen(false);
    navigate(`${ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION}?open_checkout=true`);
  }, [navigate]);

  return {
    isTrial,
    totalContratos,
    TRIAL_LIMIT,
    isLimitReached,
    isLimitDialogOpen,
    setIsLimitDialogOpen,
    checkCanCreateContract,
    handleGoToSubscription,
  };
}
