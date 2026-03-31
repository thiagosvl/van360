import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Loader2, MoreVertical } from "lucide-react";
import React, { ReactNode } from "react";

export interface ActionSheetItem {
  label: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  onClick: () => void;
  isLink?: boolean;
  href?: string;
  disabled?: boolean;
  isDestructive?: boolean;
  isLoading?: boolean;
  className?: string;
  hasSeparatorAfter?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actions: ActionSheetItem[];
  children?: ReactNode;
}

export function ActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
  children,
}: ActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-auto max-h-[85vh] rounded-t-[32px] bg-white border-none p-0 flex flex-col">
        {/* Header - Resumo ou Título */}
        {(title || description || children) && (
          <DrawerHeader className="text-left px-6 pt-6 pb-2 shrink-0">
            {title && <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">{title}</DrawerTitle>}
            {description && <DrawerDescription className="text-xs font-medium text-gray-400">{description}</DrawerDescription>}
            {children && <div className="mt-4">{children}</div>}
          </DrawerHeader>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-10 mt-2">
            <div className="flex flex-col gap-1">
              {actions.map((action, idx) => (
                <div key={`${action.label}-${idx}`}>
                  <button
                    disabled={action.disabled || action.isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (action.disabled || action.isLoading) return;
                      onOpenChange(false);
                      action.onClick();
                    }}
                    className={cn(
                      "w-full flex items-center justify-start gap-3 h-14 px-4 rounded-2xl transition-all active:scale-[0.98] outline-none",
                      action.isDestructive 
                        ? "text-red-600 bg-red-50/10 active:bg-red-50/50" 
                        : "text-[#1a3a5c] active:bg-slate-50",
                      action.disabled && "opacity-40 grayscale pointer-events-none",
                      action.className
                    )}
                  >
                    {/* Container de Ícone - Agora na esquerda e com fundo */}
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                         action.isDestructive 
                            ? "bg-red-50 text-red-600" 
                            : "bg-slate-50 text-slate-500"
                    )}>
                        {action.isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : action.icon ? (
                            <div className="h-5 w-5 flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                                <IconRenderer icon={action.icon} className="h-5 w-5" />
                            </div>
                        ) : (
                            <MoreVertical className="h-5 w-5" />
                        )}
                    </div>

                    <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                        <span className="font-bold text-sm tracking-tight truncate">{action.label}</span>
                        {(action.title || action.description) && (
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">
                                {action.title || action.description}
                            </span>
                        )}
                    </div>
                  </button>
                  {action.hasSeparatorAfter && ( idx < actions.length - 1 ) && (
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

function IconRenderer({ icon, className }: { icon: any; className?: string }) {
  if (!icon) return null;

  if (typeof icon === "function" || (typeof icon === "object" && icon.render)) {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  
  if (typeof icon === "object") {
      try {
        return React.cloneElement(icon as any, { 
          className: cn((icon as any).props?.className, className) 
        });
      } catch (e) {
        return icon;
      }
  }

  return icon;
}
