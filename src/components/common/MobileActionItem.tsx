import { Button } from "@/components/ui/button";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { ElementType, ReactNode, useState } from "react";
import { ActionSheet } from "./ActionSheet";

export interface MobileAction {
  label: string;
  icon?: ReactNode | ElementType;
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
  /** Optional title or subtext */
  title?: string;
  /** Optional secondary description */
  description?: string;
  /** If true, hides the action */
  hidden?: boolean;
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
  /** Custom direct click handler for the item (bypasses ActionSheet drawer) */
  onClickItem?: () => void;
  /** If true, hides the mobile trigger indicator on desktop view (sm and above) */
  hideTriggerOnDesktop?: boolean;
  /** If false, completely hides the 3-dots trigger button */
  showTrigger?: boolean;
}

export function MobileActionItem({
  children,
  actions,
  className,
  renderHeader,
  onClickItem,
  hideTriggerOnDesktop,
  showTrigger = true,
}: MobileActionItemProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 && !onClickItem && !renderHeader) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative group/mobile-action", className)}>
      {/* Foreground Content - Clickable area */}
      <div 
        className="relative z-10 cursor-pointer touch-manipulation"
        onClick={(e) => {
          if (onClickItem) {
            e.stopPropagation();
            onClickItem();
          } else {
            setIsSheetOpen(true);
          }
        }}
      >
        {children}
      </div>

      {/* Trigger Button - Discrete MoreVertical indicator */}
      {showTrigger && (
        <button
          type="button"
          aria-label="Opções"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-1.5 h-7 w-7 rounded-[10px] z-20 flex items-center justify-center transition-all cursor-pointer pointer-events-auto outline-none",
            "text-[#737373] opacity-50 hover:opacity-100 hover:bg-[#f5f5f5] active:bg-[#ebebeb]",
            hideTriggerOnDesktop && "sm:hidden"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (onClickItem) {
              onClickItem();
            } else {
              setIsSheetOpen(true);
            }
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}

      {/* Action Sheet (Bottom Drawer) */}
      <ActionSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            safeCloseDialog(() => setIsSheetOpen(false));
          } else {
            setIsSheetOpen(true);
          }
        }}
        actions={visibleActions.map((action) => ({
          label: action.label,
          title: action.title,
          description: action.description,
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
