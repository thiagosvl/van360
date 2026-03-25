import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { ReactNode, useState } from "react";
import { ActionSheet } from "./ActionSheet";

export interface MobileAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** No longer used for swipe, but kept for compatibility */
  swipeColor?: string;
  /** Text color/Class for Drawer item (e.g., 'text-red-600') */
  drawerClass?: string;
  /** Variant for the Drawer button/action */
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
  /** If true, action is disabled */
  disabled?: boolean;
  /** If true, action is destructive (Delete, etc) - useful for Drawer styling */
  isDestructive?: boolean;
  /** If true, shows a loader and disables the action */
  isLoading?: boolean;
}

interface MobileActionItemProps {
  children: ReactNode;
  /** List of actions in priority order */
  actions: MobileAction[];
  /** Optional visual hint on mount (No longer used, but kept for props compatibility) */
  showHint?: boolean;
  /** Custom className for the container */
  className?: string;
}

export function MobileActionItem({
  children,
  actions,
  className,
}: MobileActionItemProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter out any hidden actions if they exist
  const visibleActions = actions.filter((a: any) => !a.hidden);

  if (visibleActions.length === 0) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative group/mobile-action", className)}>
      {/* Foreground Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Trigger Button - 3 dots (Threads style) */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2.5 right-2 h-7 w-7 rounded-full z-20 transition-all",
          "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 shadow-sm",
          "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500",
          "active:scale-90"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsSheetOpen(true);
        }}
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </Button>

      {/* Action Sheet (Bottom Drawer) */}
      <ActionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        actions={visibleActions.map((action) => ({
          label: action.label,
          icon: action.icon,
          onClick: action.onClick,
          disabled: action.disabled,
          isLoading: action.isLoading,
          isDestructive: action.isDestructive || action.variant === "destructive",
          className: action.drawerClass,
        }))}
      />
    </div>
  );
}

