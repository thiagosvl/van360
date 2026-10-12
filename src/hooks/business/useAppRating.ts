import { useCallback } from "react";
import {
  recordActiveDay,
  incrementRatingCounter,
  hasMinimumMaturity,
  isEligibleForRatingPrompt,
  triggerNativeReview,
  recordSubscriberPrompted,
  getRatingTrackerState,
} from "@/utils/rating/appRatingTracker";

export function useAppRating() {
  const trackActiveDay = useCallback(() => {
    recordActiveDay();
  }, []);

  const trackReciboCompartilhado = useCallback(async () => {
    const count = incrementRatingCounter("recibosCompartilhados");
    if (count === 2 && hasMinimumMaturity() && isEligibleForRatingPrompt()) {
      await triggerNativeReview(1200);
    }
  }, []);

  const trackAlunoCadastradoOuAprovado = useCallback(async () => {
    const count = incrementRatingCounter("alunosCadastradosOuAprovados");
    if (count === 3 && hasMinimumMaturity() && isEligibleForRatingPrompt()) {
      await triggerNativeReview(1200);
    }
  }, []);

  const trackCobrancaBaixada = useCallback(async () => {
    const count = incrementRatingCounter("cobrancasBaixadas");
    if (count === 3 && hasMinimumMaturity() && isEligibleForRatingPrompt()) {
      await triggerNativeReview(1200);
    }
  }, []);

  const trackGastoRegistrado = useCallback(async () => {
    const count = incrementRatingCounter("gastosRegistrados");
    if (count === 2 && hasMinimumMaturity() && isEligibleForRatingPrompt()) {
      await triggerNativeReview(1200);
    }
  }, []);

  const checkSubscriptionConversion = useCallback(async (isActivePaidSubscriber: boolean) => {
    if (!isActivePaidSubscriber) return;

    const state = getRatingTrackerState();
    if (state.convertedSubscriberPrompted) return;

    if (hasMinimumMaturity(state) && isEligibleForRatingPrompt(state)) {
      recordSubscriberPrompted();
      await triggerNativeReview(1500);
    }
  }, []);

  return {
    trackActiveDay,
    trackReciboCompartilhado,
    trackAlunoCadastradoOuAprovado,
    trackCobrancaBaixada,
    trackGastoRegistrado,
    checkSubscriptionConversion,
    triggerNativeReview,
  };
}
