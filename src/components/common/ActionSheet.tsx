import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

export interface ActionSheetItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isDestructive?: boolean;
  isLoading?: boolean;
  className?: string;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  actions: ActionSheetItem[];
}

export function ActionSheet({
  open,
  onOpenChange,
  title,
  actions,
}: ActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[92vh] rounded-t-[32px] flex flex-col px-0 pb-8 bg-[#F9F9F9] dark:bg-zinc-950 border-0 outline-none shadow-2xl overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-full" />

        {/* Header - Apenas se tiver título, no Threads geralmente é oculto/limpo */}
        {title && (
          <SheetHeader className="text-center px-6 pt-10 mb-2">
            <SheetTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              {title}
            </SheetTitle>
          </SheetHeader>
        )}

        <div className={cn(
          "px-4 pt-8 flex flex-col gap-2 overflow-y-auto",
           !title && "pt-10" // Compensação se não houver título
        )}>
          {/* Agrupamento tipo Threads/Instagram */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] overflow-hidden border border-zinc-100 dark:border-zinc-800/50">
            {actions.map((action, idx) => (
              <Button
                key={`${action.label}-${idx}`}
                variant="ghost"
                disabled={action.disabled || action.isLoading}
                className={cn(
                  "w-full justify-between h-14 px-6 text-[15px] font-semibold transition-all active:scale-[0.98] rounded-none border-b last:border-0",
                  "border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                  // Estilo Destrutivo
                  action.isDestructive 
                      ? "text-[#FF3B30] hover:text-[#FF3B30]" 
                      : "text-zinc-900 dark:text-zinc-100",
                  // Loading/Disabled
                  (action.disabled || action.isLoading) && "opacity-50 grayscale cursor-not-allowed",
                  action.className
                )}
                onClick={() => {
                  if (action.disabled || action.isLoading) return;
                  onOpenChange(false);
                  action.onClick();
                }}
              >
                <span className="flex-1 text-left truncate">{action.label}</span>
                
                <span className={cn("shrink-0 ml-4", action.isDestructive ? "text-[#FF3B30]" : "text-zinc-400 dark:text-zinc-500")}>
                  {action.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    action.icon && <IconRenderer icon={action.icon} className="h-[22px] w-[22px]" />
                  )}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function IconRenderer({ icon, className }: { icon: any; className?: string }) {
  if (!icon) return null;
  if (typeof icon === "function" || (typeof icon === "object" && icon.render)) {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  return icon;
}

