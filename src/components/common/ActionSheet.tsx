import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import React, { ReactNode } from "react";

export interface ActionSheetItem {
  label: string;
  title?: string;
  description?: string;
  icon?: ReactNode | React.ElementType;
  onClick: () => void;
  isLink?: boolean;
  href?: string;
  disabled?: boolean;
  isDestructive?: boolean;
  isLoading?: boolean;
  className?: string;
  hasSeparatorAfter?: boolean;
  variant?: "default" | "destructive" | "ghost" | "outline" | "secondary";
  swipeColor?: string;
  drawerClass?: string;
  hidden?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actions: ActionSheetItem[];
  children?: ReactNode;
}

function groupActions(actions: ActionSheetItem[]): ActionSheetItem[][] {
  const groups: ActionSheetItem[][] = [];
  let currentGroup: ActionSheetItem[] = [];

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const isDestructive = action.isDestructive || action.variant === "destructive";
    const prevAction = i > 0 ? actions[i - 1] : null;
    const prevIsDestructive = prevAction
      ? prevAction.isDestructive || prevAction.variant === "destructive"
      : false;

    const shouldStartNewGroup =
      currentGroup.length > 0 &&
      (prevAction?.hasSeparatorAfter || (!prevIsDestructive && isDestructive));

    if (shouldStartNewGroup) {
      groups.push(currentGroup);
      currentGroup = [];
    }

    currentGroup.push(action);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function ActionItemsList({
  actions,
  onOpenChange,
}: {
  actions: ActionSheetItem[];
  onOpenChange: (open: boolean) => void;
}) {
  const groups = groupActions(actions);

  return (
    <div className="flex flex-col gap-2.5">
      {groups.map((group, groupIdx) => (
        <div
          key={`group-${groupIdx}`}
          className="bg-[#f5f5f5] rounded-[20px] border border-[#e5e5e5] overflow-hidden divide-y divide-[#e5e5e5]/80"
        >
          {group.map((action, actionIdx) => {
            const subtext = action.description || action.title;
            const isDestructive = action.isDestructive || action.variant === "destructive";

            const itemContent = (
              <>
                <div className="flex flex-col min-w-0 flex-1 pr-3">
                  <span
                    className={cn(
                      "font-medium text-[15px] truncate leading-tight",
                      isDestructive ? "text-[#e7000b]" : "text-[#0a0a0a]"
                    )}
                  >
                    {action.label}
                  </span>
                  {subtext && (
                    <span
                      className={cn(
                        "text-xs font-normal truncate mt-0.5 leading-tight",
                        isDestructive ? "text-[#e7000b]/80" : "text-[#737373]"
                      )}
                    >
                      {subtext}
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    "shrink-0 flex items-center justify-center ml-auto",
                    isDestructive ? "text-[#e7000b]" : "text-[#737373]"
                  )}
                >
                  {action.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#737373]" />
                  ) : action.icon ? (
                    <div className="h-4 w-4 flex items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
                      <IconRenderer icon={action.icon} className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
              </>
            );

            if (action.isLink && action.href) {
              return (
                <a
                  key={`${action.label}-${actionIdx}`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (action.disabled || action.isLoading) {
                      e.preventDefault();
                      return;
                    }
                    e.stopPropagation();
                    safeCloseDialog(() => onOpenChange(false));
                    action.onClick();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between min-h-[3.25rem] py-3.5 px-4 text-left transition-colors active:scale-[0.99] outline-none cursor-pointer",
                    isDestructive
                      ? "text-[#e7000b] hover:bg-red-50/70 active:bg-red-100/60"
                      : "text-[#0a0a0a] hover:bg-[#ebebeb] active:bg-[#e0e0e0]",
                    (action.disabled || action.isLoading) &&
                      "opacity-40 grayscale pointer-events-none text-[#737373]",
                    action.className
                  )}
                >
                  {itemContent}
                </a>
              );
            }

            return (
              <button
                key={`${action.label}-${actionIdx}`}
                type="button"
                disabled={action.disabled || action.isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.disabled || action.isLoading) return;
                  safeCloseDialog(() => onOpenChange(false));
                  action.onClick();
                }}
                className={cn(
                  "w-full flex items-center justify-between min-h-[3.25rem] py-3.5 px-4 text-left transition-colors active:scale-[0.99] outline-none cursor-pointer",
                  isDestructive
                    ? "text-[#e7000b] hover:bg-red-50/70 active:bg-red-100/60"
                    : "text-[#0a0a0a] hover:bg-[#ebebeb] active:bg-[#e0e0e0]",
                  (action.disabled || action.isLoading) &&
                    "opacity-40 grayscale pointer-events-none text-[#737373]",
                  action.className
                )}
              >
                {itemContent}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
  children,
}: ActionSheetProps) {
  const isMobile = useIsMobile();
  const visibleActions = actions.filter((a) => !a.hidden);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-auto max-h-[88vh] rounded-t-[32px] bg-white border-t border-[#e5e5e5] p-0 flex flex-col outline-none pb-[calc(1.5rem+var(--safe-area-bottom,env(safe-area-inset-bottom,0px)))]">
          {(title || description || children) && (
            <DrawerHeader
              className={cn(
                "text-left px-5 pt-3.5 sm:pt-4 shrink-0",
                visibleActions.length === 0 ? "pb-5" : "pb-3"
              )}
            >
              {title ? (
                <DrawerTitle className="font-semibold text-[#0a0a0a] text-base tracking-tight leading-snug">
                  {title}
                </DrawerTitle>
              ) : (
                <DrawerTitle className="sr-only">Opções</DrawerTitle>
              )}
              {description ? (
                <DrawerDescription className="text-xs font-normal text-[#737373] mt-0.5">
                  {description}
                </DrawerDescription>
              ) : (
                <DrawerDescription className="sr-only">Menu de opções</DrawerDescription>
              )}
              {children && <div className={cn("w-full", title ? "mt-2.5" : "mt-0.5")}>{children}</div>}
            </DrawerHeader>
          )}

          {visibleActions.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 pb-2 pt-1">
              <ActionItemsList actions={visibleActions} onOpenChange={onOpenChange} />
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="w-full max-w-md p-0 overflow-hidden bg-white rounded-[28px] border border-[#e5e5e5] shadow-2xl flex flex-col max-h-[85vh] gap-0 outline-none"
      >
        <button
          type="button"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          className="absolute right-4 top-4 z-10 rounded-[12px] p-1.5 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors shrink-0 cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {title ? (
          <div className="flex flex-col min-w-0 px-5 pt-4 pb-1 pr-12">
            <DialogTitle className="font-semibold text-[#0a0a0a] text-base tracking-tight leading-snug">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-xs font-normal text-[#737373] mt-0.5">
                {description}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">Menu de opções</DialogDescription>
            )}
          </div>
        ) : (
          <div className="sr-only">
            <DialogTitle>Opções</DialogTitle>
            <DialogDescription>Menu de opções</DialogDescription>
          </div>
        )}

        {children && (
          <div className={cn("px-5 w-full", title ? "pt-1 pb-3" : "pt-4 pb-3")}>
            {children}
          </div>
        )}

        {visibleActions.length > 0 && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-1">
            <ActionItemsList actions={visibleActions} onOpenChange={onOpenChange} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function IconRenderer({
  icon,
  className,
}: {
  icon: ReactNode | React.ElementType;
  className?: string;
}) {
  if (!icon) return null;

  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null && "render" in icon)
  ) {
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className={className} />;
  }

  if (React.isValidElement(icon)) {
    return React.cloneElement(
      icon as React.ReactElement<{ className?: string }>,
      {
        className: cn(icon.props?.className, className),
      }
    );
  }

  return <>{icon}</>;
}
