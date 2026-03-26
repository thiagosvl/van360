import { Capacitor } from "@capacitor/core";

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

  // Se 'web', distinguir desktop vs mobile e Android vs iOS
  const isMobile =
    window.matchMedia("(max-width: 768px)").matches ||
    /Android|iPhone|iPad/i.test(navigator.userAgent);

  if (!isMobile) return "desktop";

  // Mobile no browser — detectar SO
  if (/Android/i.test(navigator.userAgent)) return "android-web";
  if (/iPhone|iPad/i.test(navigator.userAgent)) return "ios-web";

  return "desktop"; // fallback
}

export function isNativeApp(): boolean {
  return Capacitor.getPlatform() !== "web";
}

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.van360.app";

export const QR_CODE_PLACEHOLDER =
  "https://placehold.co/200x200/1a1a2e/ffffff?text=QR+Code+Play+Store";
