import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { ReactNode, useState } from "react";
import { ActionSheet } from "./ActionSheet";

export interface MobileAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  isLink?: boolean;
  href?: string;
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
  /** Optional header content to show in the Action Sheet */
  renderHeader?: () => ReactNode;
}

export function MobileActionItem({
  children,
  actions,
  className,
  renderHeader,
}: MobileActionItemProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter out any hidden actions if they exist
  const visibleActions = actions.filter((a: any) => !a.hidden);

  if (visibleActions.length === 0) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative group/mobile-action", className)}>
      {/* Foreground Content - Clickable area */}
      <div 
        className="relative z-10 cursor-pointer touch-manipulation"
        onClick={() => setIsSheetOpen(true)}
      >
        {children}
      </div>

      {/* Trigger Button - Discrete MoreVertical indicator */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-1.5 h-6 w-6 z-20 flex items-center justify-center pointer-events-none transition-opacity",
          "text-zinc-400 opacity-30 dark:text-zinc-500"
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </div>

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
          isLink: action.isLink,
          href: action.href,
          isDestructive: action.isDestructive || action.variant === "destructive",
          className: action.drawerClass,
        }))}
      >
        {renderHeader && renderHeader()}
      </ActionSheet>
    </div>
  );
}

