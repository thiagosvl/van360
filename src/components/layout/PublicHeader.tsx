import type { ElementType, ReactNode } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicHeaderProps {
  title: string;
  subtitle?: string | null;
  icon?: ElementType;
  action?: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function PublicHeader({
  title,
  subtitle,
  icon: Icon = FileText,
  action,
  className,
  containerClassName = "max-w-6xl px-4 sm:px-6",
}: PublicHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-[#0b1a2e] h-14 sm:h-16 shadow-sm shrink-0 border-b border-white/5",
        className
      )}
    >
      <div
        className={cn(
          "h-full mx-auto w-full flex items-center justify-between",
          containerClassName
        )}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-4">
          <div className="bg-white/10 p-2 sm:p-2.5 rounded-[12px] backdrop-blur-md border border-white/10 shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
          </div>
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-xs sm:text-sm text-white tracking-tight leading-none mb-1 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] sm:text-xs font-semibold text-white/70 tracking-wider leading-none truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/logo-van360.webp"
            alt="Van360"
            className="h-7 sm:h-8 w-auto filter brightness-0 invert opacity-90 select-none"
          />
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </div>
    </header>
  );
}
