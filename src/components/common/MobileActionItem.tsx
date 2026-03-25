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
          "absolute top-3 right-3 h-8 w-8 rounded-full z-20 transition-all",
          "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm",
          "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
          "active:scale-90"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsSheetOpen(true);
        }}
      >
        <MoreVertical className="h-4 w-4" />
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

