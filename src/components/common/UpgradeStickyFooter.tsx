import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpgradeStickyFooterProps {
  title: string;
  description: string;
  buttonText?: string;
  onAction: () => void;
  visible?: boolean;
  className?: string;
}

export function UpgradeStickyFooter({
  title,
  description,
  buttonText = "Ver Planos",
  onAction,
  visible = true,
  className,
}: UpgradeStickyFooterProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 p-4 z-50 md:hidden safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white leading-tight">
            {title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <Button
          onClick={onAction}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold whitespace-nowrap"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
