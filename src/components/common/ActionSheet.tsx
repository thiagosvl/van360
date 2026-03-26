import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { ReactNode } from "react";

export interface ActionSheetItem {
  label: string;
  description?: string;
  icon?: ReactNode;
  onClick: () => void;
  isLink?: boolean;
  href?: string;
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
  children?: ReactNode;
}

export function ActionSheet({
  open,
  onOpenChange,
  title,
  actions,
  children,
}: ActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="h-auto max-h-[92vh] rounded-t-[32px] flex flex-col px-0 pb-8 bg-[#F9F9F9] dark:bg-zinc-950 border-0 outline-none shadow-2xl overflow-hidden"
      >
        {/* Header - Apenas se tiver título */}
        {title && (
          <DrawerHeader className="text-center px-6 pt-6 mb-2">
            <DrawerTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              {title}
            </DrawerTitle>
          </DrawerHeader>
        )}

        <div className={cn(
          "px-4 pt-4 flex flex-col gap-2 overflow-y-auto",
           !title && "pt-6" // Compensação se não houver título
        )}>
          {/* Conteúdo customizado (Header/Resumo) */}
          {children && (
            <div className="mb-2">
              {children}
            </div>
          )}

          {/* Agrupamento tipo Threads/Instagram */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] overflow-hidden border border-zinc-100/50 dark:border-zinc-800/30">
            {actions.map((action, idx) => {
              // Determinamos a cor de fundo com base no estado e tipo
              const bgHoverClass = action.isDestructive 
                ? "active:bg-rose-50 dark:active:bg-rose-900/10" 
                : "active:bg-zinc-100 dark:active:bg-zinc-800/50";

              const commonClasses = cn(
                "w-full flex items-center justify-between text-[15px] font-semibold transition-all active:scale-[0.99] rounded-none border-b last:border-0 h-auto py-4 px-6 gap-x-4",
                "border-zinc-50 dark:border-zinc-800/20 text-left relative",
                bgHoverClass,
                // Estilo Destrutivo
                action.isDestructive 
                    ? "text-[#FF3B30]" 
                    : "text-zinc-900 dark:text-zinc-100",
                // Loading/Disabled
                (action.disabled || action.isLoading) && "opacity-50 grayscale cursor-not-allowed",
                action.className
              );

              const content = (
                <>
                  {/* Container de Texto */}
                  <div className="flex-1 flex flex-col min-w-0 pointer-events-none">
                    <span className="text-[16px] font-bold tracking-tight leading-normal">
                      {action.label}
                    </span>
                    {action.description && (
                      <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight lg:leading-normal">
                        {action.description}
                      </span>
                    )}
                  </div>
                  
                  {/* Container de Ícone */}
                  <div className={cn(
                    "flex-shrink-0 flex items-center justify-center p-2 rounded-xl transition-colors pointer-events-none",
                    action.isDestructive ? "bg-rose-50/50 dark:bg-rose-900/10 text-[#FF3B30]" : "text-zinc-400 dark:text-zinc-500"
                  )}>
                    {action.isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      action.icon && <IconRenderer icon={action.icon} className="h-5 w-5" />
                    )}
                  </div>
                </>
              );

              if (action.isLink && action.href) {
                return (
                  <a
                    key={`${action.label}-${idx}`}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={commonClasses}
                    onClick={() => onOpenChange(false)}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={`${action.label}-${idx}`}
                  disabled={action.disabled || action.isLoading}
                  className={commonClasses}
                  onClick={() => {
                    if (action.disabled || action.isLoading) return;
                    onOpenChange(false);
                    action.onClick();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function IconRenderer({ icon, className }: { icon: any; className?: string }) {
  if (!icon) return null;

  // Se é uma função de componente Lucide ou similar (ex: Users)
  if (typeof icon === "function" || (typeof icon === "object" && icon.render)) {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  
  // Se é um elemento React já instanciado (ex: <Users className="h-5 w-5" />)
  if (typeof icon === "object") {
      // Tenta clonar e injetar a className para consistência
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

