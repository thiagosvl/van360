import * as React from "react";
import { cn } from "@/lib/utils";

export interface WhatsAppActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function WhatsAppActionButton({
  label,
  icon,
  onClick,
  disabled = false,
}: WhatsAppActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-10 min-[360px]:h-11 px-3 bg-white hover:bg-[#f7f8f9] active:bg-[#f0f2f5] text-[#00a884] font-medium text-[13px] min-[360px]:text-[14px] flex items-center justify-center gap-2 border-t border-[#e9edef] rounded-b-[7.5px] transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export interface WhatsAppMessageContainerProps {
  driverName: string;
  time?: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  footerNote?: React.ReactNode;
  className?: string;
}

export function WhatsAppMessageContainer({
  driverName,
  time = "16:22",
  children,
  actionButton,
  footerNote,
  className,
}: WhatsAppMessageContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[310px] xl:max-w-[320px] mx-auto sm:mx-0 xl:mx-auto relative rounded-[24px] bg-[#efeae2] p-2.5 min-[360px]:p-3 border border-slate-200/90 shadow-inner overflow-hidden flex flex-col items-start min-h-[350px] xl:min-h-[440px] justify-start",
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/whatsapp-wallpaper.png')",
        }}
      />

      <div
        className="relative w-full max-w-[258px] xl:max-w-[276px] bg-white rounded-r-[7.5px] rounded-b-[7.5px] rounded-tl-none shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21] ml-1.5"
        style={{
          fontFamily:
            "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <svg
          viewBox="0 0 8 13"
          height="13"
          width="8"
          className="absolute -left-2 top-0 pointer-events-none drop-shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
        >
          <path
            opacity="0.13"
            fill="#000000"
            d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
          />
          <path
            fill="#ffffff"
            d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"
          />
        </svg>

        <div className="px-3 pt-2 pb-1.5 min-[360px]:px-3 min-[360px]:pt-2 min-[360px]:pb-1.5 space-y-1.5 min-[360px]:space-y-2">
          <p className="font-bold text-[#111b21] text-[12px] min-[360px]:text-[13px] leading-tight">
            Transporte Escolar · {driverName}
          </p>

          <div className="space-y-1.5 min-[360px]:space-y-2 text-[#111b21] text-[11.5px] min-[360px]:text-[12.5px] leading-[15.5px] min-[360px]:leading-[17px]">
            {children}
          </div>

          <div className="flex items-end justify-between gap-2 pt-0.5 text-[9.5px] min-[360px]:text-[10px] text-[#667781] leading-tight">
            <span className="truncate">
              Mensagem via Van360 · Não responda.
            </span>
            <span className="shrink-0 text-[9.5px] min-[360px]:text-[10px] text-[#667781] select-none">
              {time}
            </span>
          </div>
        </div>

        {actionButton}
      </div>

      {footerNote && (
        <div className="text-[11px] min-[360px]:text-xs text-slate-500 text-center mt-2 min-[360px]:mt-2.5 px-1 min-[360px]:px-2 leading-snug">
          {footerNote}
        </div>
      )}
    </div>
  );
}
