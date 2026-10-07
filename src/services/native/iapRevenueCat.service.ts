import { Purchases, PurchasesStoreProduct, CustomerInfo } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";
import { isNativeIos } from "@/utils/detectPlatform";

export const REVENUECAT_APPLE_API_KEY = "appl_gHihyPXIrBfJVmMvjkVLXRaQUiw";

export const IAP_ENTITLEMENT_ID = "van360_pro";

export const IAP_PRODUCTS = {
  MENSAL_110: "van360_mensal_110",
  ANUAL_110: "van360_anual_110",
  MENSAL_250: "van360_mensal_250_alunos",
  ANUAL_250: "van360_anual_250",
} as const;

export type IAPProductId = (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS];

export enum IapCapacityTier {
  TIER_110 = 110,
  TIER_250 = 250,
  TIER_PLUS_250 = 251,
}

export const IAP_TIER_PRICES = {
  [IapCapacityTier.TIER_110]: {
    monthly: 39.9,
    annual: 399.9,
  },
  [IapCapacityTier.TIER_250]: {
    monthly: 99.9,
    annual: 990.0,
  },
} as const;

let isInitialized = false;

export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!isNativeIos() && Capacitor.getPlatform() !== "ios") {
    return;
  }

  if (isInitialized) {
    if (userId) {
      try {
        await Purchases.logIn({ appUserID: userId });
      } catch (err) {
        console.error("[RevenueCat] Erro ao associar appUserID:", err);
      }
    }
    return;
  }

  try {
    await Purchases.configure({
      apiKey: REVENUECAT_APPLE_API_KEY,
      appUserID: userId || null,
    });
    isInitialized = true;
  } catch (err) {
    console.error("[RevenueCat] Falha na inicializacao do SDK:", err);
  }
}

export async function loginRevenueCat(userId: string): Promise<void> {
  if (!isNativeIos() && Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    if (!isInitialized) {
      await initializeRevenueCat(userId);
      return;
    }
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    console.error("[RevenueCat] Erro ao logar usuario:", err);
  }
}

export async function logoutRevenueCat(): Promise<void> {
  if (!isNativeIos() && Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    if (isInitialized) {
      await Purchases.logOut();
    }
  } catch (err) {
    console.error("[RevenueCat] Erro ao deslogar:", err);
  }
}

export async function getIosProducts(): Promise<PurchasesStoreProduct[]> {
  if (!isNativeIos() && Capacitor.getPlatform() !== "ios") {
    return [];
  }

  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }
    const identifiers = Object.values(IAP_PRODUCTS);
    const result = await Purchases.getProducts({ productIdentifiers: identifiers });
    return result.products || [];
  } catch (err) {
    console.error("[RevenueCat] Erro ao buscar produtos:", err);
    return [];
  }
}

export interface PurchaseResult {
  success: boolean;
  userCancelled: boolean;
  customerInfo?: CustomerInfo;
  errorMessage?: string;
}

export async function purchaseIosProduct(productId: IAPProductId | string): Promise<PurchaseResult> {
  if (!isNativeIos() && Capacitor.getPlatform() !== "ios") {
    return {
      success: false,
      userCancelled: false,
      errorMessage: "Disponivel exclusivamente em dispositivos iOS.",
    };
  }

  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }

    const { products } = await Purchases.getProducts({ productIdentifiers: [productId] });
    const product = products.find((p) => p.identifier === productId);

    if (!product) {
      return {
        success: false,
        userCancelled: false,
        errorMessage: "Produto nao encontrado na App Store.",
      };
    }

    const purchaseResult = await Purchases.purchaseStoreProduct({ product });
    const hasActiveEntitlement = Boolean(
      purchaseResult.customerInfo?.entitlements.active[IAP_ENTITLEMENT_ID]
    );

    return {
      success: hasActiveEntitlement,
      userCancelled: false,
      customerInfo: purchaseResult.customerInfo,
    };
  } catch (err: unknown) {
    const error = err as { code?: number | string; message?: string; userCancelled?: boolean };
    const isCancelled =
      error?.userCancelled === true ||
      error?.code === "1" ||
      error?.code === 1 ||
      error?.message?.toLowerCase().includes("cancel");

    return {
      success: false,
      userCancelled: Boolean(isCancelled),
      errorMessage: isCancelled ? undefined : error?.message || "Falha na transacao com a App Store.",
    };
  }
}

export interface RestorePurchasesResult {
  success: boolean;
  hasActiveSubscription: boolean;
  customerInfo?: CustomerInfo;
  errorMessage?: string;
}

export async function restoreIosPurchases(): Promise<RestorePurchasesResult> {
  if (!isNativeIos() && Capacitor.getPlatform() !== "ios") {
    return {
      success: false,
      hasActiveSubscription: false,
      errorMessage: "Disponivel exclusivamente em dispositivos iOS.",
    };
  }

  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }

    const { customerInfo } = await Purchases.restorePurchases();
    const hasActiveSubscription = Boolean(
      customerInfo?.entitlements.active[IAP_ENTITLEMENT_ID]
    );

    return {
      success: true,
      hasActiveSubscription,
      customerInfo,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return {
      success: false,
      hasActiveSubscription: false,
      errorMessage: error?.message || "Nao foi possivel restaurar compras anteriores.",
    };
  }
}
