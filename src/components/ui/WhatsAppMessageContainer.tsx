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
        "w-full relative rounded-2xl bg-[#efeae2] p-2.5 min-[360px]:p-4 sm:p-5 border border-slate-200/80 shadow-inner overflow-hidden flex flex-col items-center",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000000 0.75px, transparent 0.75px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div
        className="relative max-w-[340px] w-full bg-white rounded-r-[7.5px] rounded-b-[7.5px] rounded-tl-none shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[#111b21]"
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

        <div className="px-3 pt-2 pb-1.5 min-[360px]:px-3.5 min-[360px]:pt-2.5 min-[360px]:pb-2 space-y-2 min-[360px]:space-y-3">
          <p className="font-bold text-[#111b21] text-[13px] min-[360px]:text-[14.2px] leading-tight">
            Transporte Escolar · {driverName}
          </p>

          <div className="space-y-2 min-[360px]:space-y-3 text-[#111b21] text-[13px] min-[360px]:text-[14.2px] leading-[17.5px] min-[360px]:leading-[19px]">
            {children}
          </div>

          <div className="flex items-end justify-between gap-3 pt-0.5 text-[10px] min-[360px]:text-[11px] text-[#667781] leading-tight">
            <span className="max-w-[210px]">
              Mensagem automática via Van360 · Não responda.
            </span>
            <span className="shrink-0 text-[10px] min-[360px]:text-[11px] text-[#667781] select-none">
              {time}
            </span>
          </div>
        </div>

        {actionButton}
      </div>

      {footerNote && (
        <div className="text-[11px] min-[360px]:text-xs text-slate-500 text-center mt-2 min-[360px]:mt-3 px-1 min-[360px]:px-2 leading-snug min-[360px]:leading-relaxed">
          {footerNote}
        </div>
      )}
    </div>
  );
}
