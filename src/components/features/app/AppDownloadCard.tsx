import React from "react";
import { cn } from "@/lib/utils";
import {
  getAppPlatformEligibility,
  isNativeApp,
  PLAY_STORE_URL,
  PLAY_STORE_BADGE_URL,
  APP_STORE_URL,
  APP_STORE_BADGE_URL,
} from "@/utils/detectPlatform";

interface AppDownloadCardProps {
  className?: string;
}

export const AppDownloadCard: React.FC<AppDownloadCardProps> = ({ className }) => {
  if (isNativeApp()) return null;

  const { isEligibleAndroid, isEligibleIos, hasEligibleApp } = getAppPlatformEligibility();

  if (!hasEligibleApp) {
    return null;
  }

  return (
    <section className="px-1">
      <div
        className={cn(
          "bg-white rounded-[24px] shadow-xs border border-[#e5e5e5] overflow-hidden relative p-5 sm:p-6 text-center flex flex-col items-center transition-all duration-300 animate-in fade-in slide-in-from-top-2",
          className
        )}
      >
        <h3 className="font-bold text-foreground text-[16px] sm:text-[17px] tracking-tight">
          Baixe o nosso App
        </h3>

        <p className="text-xs text-muted-foreground font-normal mt-1 max-w-md leading-relaxed">
          O aplicativo é leve e te envia notificações sobre a sua van. Acesse também pelo computador ou tablet.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {isEligibleAndroid && (
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

          {isEligibleIos && (
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
