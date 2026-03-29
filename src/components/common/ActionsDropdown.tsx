import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { cn } from "@/lib/utils";
import { ActionItem } from "@/types/actions";
import { Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";

interface ActionsDropdownProps {
  actions: ActionItem[];
  triggerClassName?: string;
  triggerSize?: "sm" | "icon" | "default" | "lg";
  align?: "end" | "center" | "start";
  disabled?: boolean;
  title?: string;
  description?: string;
  header?: React.ReactNode;
}

export function ActionsDropdown({
  actions,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
  align = "end",
  disabled = false,
  title,
  description,
  header,
}: ActionsDropdownProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter out hidden actions
  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 || disabled) {
    return (
      <Button
        variant="ghost"
        size={triggerSize}
        className={cn("text-gray-300 cursor-not-allowed opacity-30", triggerClassName)}
        disabled
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    );
  }

  const trigger = (
    <Button
      variant="ghost"
      size={triggerSize}
      className={cn(
        "h-8 w-8 rounded-full border-0 text-zinc-400 opacity-40 hover:opacity-100 transition-opacity",
        triggerClassName
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          {trigger}
        </DrawerTrigger>
        <DrawerContent className="h-auto max-h-[85vh] rounded-t-[32px] bg-white border-none p-0 flex flex-col">
          {(title || description || header) && (
            <DrawerHeader className="text-left px-6 pt-6 pb-2 shrink-0">
              {title && <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">{title}</DrawerTitle>}
              {description && <DrawerDescription className="text-xs font-medium text-gray-400">{description}</DrawerDescription>}
              {header && <div className="mt-4">{header}</div>}
            </DrawerHeader>
          )}
          
          <div className="flex-1 overflow-y-auto px-4 pb-10 mt-2">
            <div className="flex flex-col gap-1">
              {visibleActions.map((action, idx) => (
                <div key={`${action.label}-${idx}`}>
                  <button
                    disabled={action.disabled || action.isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (action.disabled || action.isLoading) return;
                      setIsOpen(false);
                      action.onClick();
                    }}
                    className={cn(
                      "w-full flex items-center justify-start gap-3 h-14 px-4 rounded-2xl transition-all active:scale-[0.98] outline-none",
                      action.isDestructive || action.variant === "destructive" 
                        ? "text-red-600 bg-red-50/10 active:bg-red-50/50" 
                        : "text-[#1a3a5c] active:bg-slate-50",
                      action.disabled && "opacity-40 grayscale pointer-events-none",
                      action.className
                    )}
                  >
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                         action.isDestructive || action.variant === 'destructive' 
                            ? "bg-red-50 text-red-600" 
                            : "bg-slate-50 text-slate-500"
                    )}>
                        {action.isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : action.icon ? (
                            <div className="h-5 w-5 flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                                {action.icon}
                            </div>
                        ) : (
                            <MoreVertical className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                        <span className="font-bold text-sm tracking-tight truncate">{action.label}</span>
                        {action.title && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{action.title}</span>}
                    </div>
                  </button>
                  {action.hasSeparatorAfter && ( idx < visibleActions.length - 1 ) && (
                    <div className="h-px bg-slate-100/50 mx-4 my-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 rounded-xl border-gray-100 shadow-xl p-1">
        {visibleActions.map((action, idx) => (
          <div key={`${action.label}-${idx}`}>
            <DropdownMenuItem
              asChild={action.isLink && !!action.href}
              onClick={(e) => {
                 if (action.disabled || action.isLoading) return;
                 if (!action.isLink) {
                   e.stopPropagation();
                   action.onClick();
                 }
              }}
              disabled={action.disabled || action.isLoading}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium",
                action.isDestructive || action.variant === "destructive" ? "text-red-600 focus:text-red-600" : "text-gray-700",
                action.className
              )}
              title={action.title}
            >
              {action.isLink && action.href ? (
                <a 
                  href={action.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {action.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  ) : action.icon && (
                    <span className={cn("h-4 w-4", 
                       (action.isDestructive || action.variant === 'destructive') ? "text-red-600" : "text-current"
                    )}>
                       {action.icon}
                    </span>
                  )}
                  {action.label}
                </a>
              ) : (
                <>
                  {action.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  ) : action.icon && (
                    <span className={cn("h-4 w-4", 
                       (action.isDestructive || action.variant === 'destructive') ? "text-red-600" : "text-current"
                    )}>
                       {action.icon}
                    </span>
                  )}
                  {action.label}
                </>
              )}
            </DropdownMenuItem>
            {action.hasSeparatorAfter && (
                <DropdownMenuSeparator className="bg-gray-50 my-1" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
