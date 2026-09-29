import React from "react";
import { cn } from "@/lib/utils";
import {
  detectPlatform,
  isNativeApp,
  PLAY_STORE_URL,
  PLAY_STORE_BADGE_URL,
  APP_STORE_URL,
  APP_STORE_BADGE_URL,
  APP_AVAILABILITY,
} from "@/utils/detectPlatform";

interface SmartAppBannerProps {
  className?: string;
}

export const SmartAppBanner: React.FC<SmartAppBannerProps> = ({ className }) => {
  if (isNativeApp()) return null;

  const platform = detectPlatform();
  const isEligibleAndroid = platform === "android-web" && APP_AVAILABILITY.android;
  const isEligibleIos = platform === "ios-web" && APP_AVAILABILITY.ios;
  const isEligibleDesktop = platform === "desktop" && APP_AVAILABILITY.android && APP_AVAILABILITY.ios;

  if (!isEligibleAndroid && !isEligibleIos && !isEligibleDesktop) {
    return null;
  }

  return (
    <section className="px-1">
      <div
        className={cn(
          "bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden relative p-5 sm:p-6 text-center flex flex-col items-center transition-all duration-300 animate-in fade-in slide-in-from-top-2",
          className
        )}
      >
        <h3 className="font-bold text-[#1a3a5c] text-[16px] sm:text-[17px] tracking-tight">
          Baixe o nosso App
        </h3>

        <p className="text-xs text-slate-500 font-normal mt-1 max-w-md leading-relaxed">
          O aplicativo é leve e te envia notificações sobre a sua van. Você também pode acessar pelo computador ou tablet.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {(isEligibleAndroid || isEligibleDesktop) && (
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:-translate-y-0.5 active:scale-95 transition-transform"
              aria-label="Disponível no Google Play"
            >
              <img
                src={PLAY_STORE_BADGE_URL}
                alt="Disponível no Google Play"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </a>
          )}

          {(isEligibleIos || isEligibleDesktop) && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:-translate-y-0.5 active:scale-95 transition-transform"
              aria-label="Baixar na App Store"
            >
              <img
                src={APP_STORE_BADGE_URL}
                alt="Baixar na App Store"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
