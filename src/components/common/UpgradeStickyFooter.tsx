import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface UpgradeStickyFooterProps {
  title: string;
  description: string;
  buttonText?: string;
  onAction: () => void;
  visible?: boolean;
  className?: string;
  storageKey?: string; // Optional: Allow different keys for different footers if needed
}

export function UpgradeStickyFooter({
  title,
  description,
  buttonText = "Ver Planos",
  onAction,
  visible = true,
  className,
  storageKey = "hide_upgrade_footer_session",
}: UpgradeStickyFooterProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Check storage on mount
  useEffect(() => {
    const isClosed = sessionStorage.getItem(storageKey);
    // Only show if passed 'visible' is true AND not closed in session
    if (visible && !isClosed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [visible, storageKey]);

  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    sessionStorage.setItem(storageKey, "true");
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 max-[320px]:p-3 z-50 md:hidden safe-area-pb shadow-2xl",
        className
      )}
    >
      {/* Close Button - Top Right */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>

      <div className="flex items-center justify-between gap-4 max-[320px]:gap-2 pr-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight max-[320px]:text-xs">
            {title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-[320px]:hidden">
            {description}
          </p>
        </div>
        <Button
          onClick={onAction}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold whitespace-nowrap shrink-0 max-[320px]:h-8 max-[320px]:text-xs max-[320px]:px-3"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
