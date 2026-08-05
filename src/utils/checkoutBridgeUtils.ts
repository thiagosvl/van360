import { ROUTES } from "@/constants/routes";
import { SubscriptionInvoiceStatus } from "@/types/enums";

export interface CheckoutBridgeParams {
  accessToken: string | null;
  refreshToken: string | null;
  autoOpen: boolean;
  isValid: boolean;
  targetRoute: string;
}

export function extractCheckoutBridgeParams(searchParams: URLSearchParams): CheckoutBridgeParams {
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const autoOpen = searchParams.get("auto_open") === "true";

  const isValid = Boolean(accessToken && refreshToken);

  if (!isValid) {
    return {
      accessToken: null,
      refreshToken: null,
      autoOpen,
      isValid: false,
      targetRoute: ROUTES.PUBLIC.LOGIN,
    };
  }

  const querySuffix = autoOpen ? "?open_checkout=true" : "";
  const targetRoute = `${ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION}${querySuffix}`;

  return {
    accessToken,
    refreshToken,
    autoOpen,
    isValid: true,
    targetRoute,
  };
}

export interface PollPaymentOptions {
  checkStatus: () => Promise<SubscriptionInvoiceStatus>;
  maxAttempts?: number;
  intervalMs?: number;
}

export interface PollPaymentResult {
  confirmed: boolean;
  attempts: number;
  finalStatus: SubscriptionInvoiceStatus;
}

export async function pollPaymentConfirmation({
  checkStatus,
  maxAttempts = 5,
  intervalMs = 10,
}: PollPaymentOptions): Promise<PollPaymentResult> {
  let attempts = 0;
  let lastStatus = SubscriptionInvoiceStatus.PENDING;

  while (attempts < maxAttempts) {
    attempts++;
    lastStatus = await checkStatus();
    if (lastStatus === SubscriptionInvoiceStatus.PAID) {
      return {
        confirmed: true,
        attempts,
        finalStatus: lastStatus,
      };
    }
    if (attempts < maxAttempts && intervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    confirmed: lastStatus === SubscriptionInvoiceStatus.PAID,
    attempts,
    finalStatus: lastStatus,
  };
}
