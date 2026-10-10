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
import { Loader2, MoreVertical, X } from "lucide-react";
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

function ActionItemsList({
  actions,
  onOpenChange,
}: {
  actions: ActionSheetItem[];
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {actions.map((action, idx) => {
        const subtext = action.description || action.title;
        const isDestructive = action.isDestructive || action.variant === "destructive";

        const content = (
          <>
            <div
              className={cn(
                "w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-colors border",
                isDestructive
                  ? "bg-red-50 text-[#e7000b] border-red-200/60"
                  : "bg-[#f5f5f5] text-[#0a0a0a] border-[#e5e5e5]"
              )}
            >
              {action.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#737373]" />
              ) : action.icon ? (
                <div className="h-4 w-4 flex items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
                  <IconRenderer icon={action.icon} className="h-4 w-4" />
                </div>
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={cn(
                  "font-medium text-sm truncate leading-tight",
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
          </>
        );

        return (
          <div key={`${action.label}-${idx}`}>
            {action.isLink && action.href ? (
              <a
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
                  "w-full flex items-center justify-start gap-3 min-h-[3.25rem] py-2 px-3.5 rounded-[16px] transition-colors active:scale-[0.99] outline-none text-left cursor-pointer",
                  isDestructive
                    ? "text-[#e7000b] hover:bg-red-50/70 active:bg-red-100/60"
                    : "text-[#0a0a0a] hover:bg-[#f5f5f5] active:bg-[#ebebeb]",
                  (action.disabled || action.isLoading) && "opacity-40 grayscale pointer-events-none text-[#737373]",
                  action.className
                )}
              >
                {content}
              </a>
            ) : (
              <button
                type="button"
                disabled={action.disabled || action.isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.disabled || action.isLoading) return;
                  safeCloseDialog(() => onOpenChange(false));
                  action.onClick();
                }}
                className={cn(
                  "w-full flex items-center justify-start gap-3 min-h-[3.25rem] py-2 px-3.5 rounded-[16px] transition-colors active:scale-[0.99] outline-none text-left cursor-pointer",
                  isDestructive
                    ? "text-[#e7000b] hover:bg-red-50/70 active:bg-red-100/60"
                    : "text-[#0a0a0a] hover:bg-[#f5f5f5] active:bg-[#ebebeb]",
                  (action.disabled || action.isLoading) && "opacity-40 grayscale pointer-events-none text-[#737373]",
                  action.className
                )}
              >
                {content}
              </button>
            )}
          </div>
        );
      })}
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
        <DrawerContent className="h-auto max-h-[85vh] rounded-t-[28px] bg-white border-t border-[#e5e5e5] p-0 flex flex-col outline-none pb-[calc(1.5rem+var(--safe-area-bottom,env(safe-area-inset-bottom,0px)))]">
          <DrawerHeader
            className={cn(
              "text-left px-5 pt-4 shrink-0",
              visibleActions.length === 0 ? "pb-5" : "pb-2",
              !title && !description && !children && "sr-only"
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
            {children && <div className="mt-2 w-full">{children}</div>}
          </DrawerHeader>

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
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          {title ? (
            <div className="flex flex-col min-w-0 pr-3">
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
            <>
              <DialogTitle className="sr-only">Opções</DialogTitle>
              <DialogDescription className="sr-only">Menu de opções</DialogDescription>
              <div />
            </>
          )}

          <button
            type="button"
            onClick={() => safeCloseDialog(() => onOpenChange(false))}
            className="rounded-[12px] p-1.5 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors shrink-0 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children && (
          <div className="px-5 pt-1 pb-2 w-full">
            {children}
          </div>
        )}

        {visibleActions.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
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
