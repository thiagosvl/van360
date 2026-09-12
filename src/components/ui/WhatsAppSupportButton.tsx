import { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppUrl } from "@/constants";
import { openBrowserLink } from "@/utils/browser";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WhatsAppSupportButtonProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  message?: string;
  className?: string;
  onClick?: () => void;
  size?: "default" | "sm" | "lg";
}

export function WhatsAppSupportButton({
  title = "Falar com Suporte",
  subtitle = "Tire suas dúvidas sobre o app",
  message = "Olá, preciso de ajuda com o Van360",
  className,
  onClick,
  size = "default",
}: WhatsAppSupportButtonProps) {
  const handleClick = () => {
    onClick?.();
    openBrowserLink(getWhatsAppUrl(message));
  };

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full group flex items-center justify-between bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-2xl transition-all cursor-pointer shadow-2xs text-left active:scale-[0.99]",
        isSmall ? "p-3" : isLarge ? "p-4 sm:p-5" : "p-3.5 sm:p-4",
        className
      )}
    >
      <div className={cn("flex items-center min-w-0", isSmall ? "gap-2.5" : "gap-3 sm:gap-3.5")}>
        <div
          className={cn(
            "rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0",
            isSmall ? "h-9 w-9" : isLarge ? "h-11 w-11 sm:h-12 sm:w-12" : "h-10 w-10"
          )}
        >
          <WhatsAppIcon className={cn("text-white", isSmall ? "h-4 w-4" : isLarge ? "h-5 w-5 sm:h-6 sm:w-6" : "h-5 w-5")} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold text-emerald-950 leading-tight", isSmall ? "text-xs" : isLarge ? "text-sm sm:text-base" : "text-sm")}>
            {title}
          </p>
          {subtitle && (
            <p className={cn("text-emerald-800 font-medium leading-normal mt-0.5", isSmall ? "text-[11px]" : "text-xs")}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-emerald-700 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </button>
  );
}
