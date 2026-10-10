import { Capacitor } from "@capacitor/core";
import { DispositivoCadastro } from "@/types/enums";
import { STORAGE_KEYS } from "@/constants";

export type PlatformType =
  | "android"      // app nativo Android (Capacitor)
  | "ios"          // app nativo iOS (Capacitor) — futuro
  | "desktop"      // browser desktop
  | "android-web"  // browser mobile Android
  | "ios-web";     // browser mobile iOS

export function detectPlatform(): PlatformType {
  const platform = Capacitor.getPlatform(); // 'web' | 'android' | 'ios'

  if (platform === "android") return "android";
  if (platform === "ios") return "ios";

  if (typeof window !== "undefined") {
    const searchMock = new URLSearchParams(window.location.search).get("mockPlatform");
    const storageMock = window.localStorage.getItem(STORAGE_KEYS.MOCK_PLATFORM);
    const mock = (searchMock || storageMock || "").toLowerCase();

    if (mock === "ios" || mock === "ios-web") return "ios-web";
    if (mock === "android" || mock === "android-web") return "android-web";
    if (mock === "desktop") return "desktop";
  }

  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const isIpadOS = typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isIos = typeof navigator !== "undefined" && (/iPhone|iPad|iPod/i.test(navigator.userAgent) || isIpadOS);

  if (isAndroid) return "android-web";
  if (isIos) return "ios-web";

  return "desktop";
}

export function getDispositivoCadastro(): DispositivoCadastro {
  const platform = Capacitor.getPlatform();

  if (platform === "android") return DispositivoCadastro.APP_ANDROID;
  if (platform === "ios") return DispositivoCadastro.APP_IOS;

  if (typeof window !== "undefined") {
    const searchMock = new URLSearchParams(window.location.search).get("mockPlatform");
    const storageMock = window.localStorage.getItem(STORAGE_KEYS.MOCK_PLATFORM);
    const mock = (searchMock || storageMock || "").toLowerCase();

    if (mock === "ios" || mock === "ios-web") return DispositivoCadastro.WEB_MOBILE_IOS;
    if (mock === "android" || mock === "android-web") return DispositivoCadastro.WEB_MOBILE_ANDROID;
    if (mock === "desktop") return DispositivoCadastro.WEB_DESKTOP;
  }

  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const isIpadOS = typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isIos = typeof navigator !== "undefined" && (/iPhone|iPad|iPod/i.test(navigator.userAgent) || isIpadOS);

  if (isAndroid) return DispositivoCadastro.WEB_MOBILE_ANDROID;
  if (isIos) return DispositivoCadastro.WEB_MOBILE_IOS;

  return DispositivoCadastro.WEB_DESKTOP;
}


export function isNativeApp(): boolean {
  return Capacitor.getPlatform() !== "web";
}

export function isNativeIos(): boolean {
  if (typeof window !== "undefined") {
    const searchMock = new URLSearchParams(window.location.search).get("mockPlatform");
    if (searchMock === "ios") return true;
    if (searchMock === "web" || searchMock === "android") return false;

    const storageMock = window.localStorage.getItem(STORAGE_KEYS.MOCK_PLATFORM);
    if (storageMock === "ios") return true;
    if (storageMock === "web" || storageMock === "android") return false;
  }
  return Capacitor.getPlatform() === "ios";
}

export function isDevEnv(): boolean {
  return Boolean(import.meta.env.DEV || import.meta.env.MODE === "development");
}

export const IS_DEV = isDevEnv();

export function isMobilePlatform(): boolean {
  return detectPlatform() !== "desktop";
}

export const ANDROID_PACKAGE_NAME = "com.tibis.van360";

export const PLAY_STORE_URL =
  `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

export const PLAY_STORE_MARKET_URL =
  `market://details?id=${ANDROID_PACKAGE_NAME}`;

export const PLAY_STORE_BADGE_URL = "/assets/badge-google-play.png";

export const APP_STORE_URL = "https://apps.apple.com/app/id6816251189";

export const APP_STORE_MARKET_URL = "itms-apps://itunes.apple.com/app/id6816251189";

export const APP_STORE_BADGE_URL = "/assets/badge-app-store.png";

export const APP_AVAILABILITY = {
  android: true,
  ios: true,
} as const;

export function getAppPlatformEligibility() {
  const platform = detectPlatform();

  const isAndroidPlatform = platform === "android-web" || platform === "android";
  const isIosPlatform = platform === "ios-web" || platform === "ios";
  const isDesktopPlatform = platform === "desktop";

  const showAndroid = (isAndroidPlatform || isDesktopPlatform) && APP_AVAILABILITY.android;
  const showIos = (isIosPlatform || isDesktopPlatform) && APP_AVAILABILITY.ios;
  const hasEligibleApp = showAndroid || showIos;

  return {
    platform,
    isEligibleAndroid: showAndroid,
    isEligibleIos: showIos,
    isEligibleDesktop: isDesktopPlatform,
    hasEligibleApp,
  };
}
