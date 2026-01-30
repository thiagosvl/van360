
import { LockOverlay } from "@/components/common/LockOverlay";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import React from "react";

interface KPICardProps {
  title: string;
  value: any;
  count?: number; // Made optional
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  className?: string;
  countLabel?: string;
  countVisible?: boolean;
  countText?: React.ReactNode;
  restricted?: boolean;
  onClick?: () => void;
  format?: "currency" | "number";
}

export function KPICard({
  title,
  value,
  count,
  icon: Icon,
  colorClass,
  bgClass,
  className,
  countLabel = "Passageiro",
  countVisible = true,
  countText,
  restricted,
  onClick,
  format = "currency",
}: KPICardProps) {
  // Verificar se value é um ReactNode (elemento React)
  const isReactNode = React.isValidElement(value);
  
  // Se for ReactNode, usar diretamente; caso contrário, tentar animar como número
  const animatedValue = !isReactNode && typeof value === "number" 
    ? useAnimatedNumber(value, 1000) 
    : null;
    
  const animatedCount = useAnimatedNumber(count ?? 0, 1000);

  // Função para formatar o valor
  const renderValue = () => {
    if (isReactNode) {
      return value;
    }
    if (animatedValue !== null && typeof animatedValue === "number") {
      const numValue = isNaN(animatedValue) || !isFinite(animatedValue) ? 0 : animatedValue;
      
      if (format === "number") {
         return Math.round(numValue); // Or specific number formatting if needed
      }

      return formatCurrency(numValue);
    }
    // Fallback para outros tipos
    if (typeof value === "number") {
      const numValue = isNaN(value) || !isFinite(value) ? 0 : value;
      
      if (format === "number") {
         return numValue;
      }

      return formatCurrency(numValue);
    }
    return String(value ?? "R$ 0,00");
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white p-2 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px] relative overflow-hidden",
        onClick && "cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "h-5 w-5 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <IconRenderer icon={Icon} className={cn("h-3 w-3 sm:h-5 sm:w-5", colorClass)} />
      </div>
      <div className="relative z-10">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        <div className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          {renderValue()}
        </div>
        
        {(count !== undefined || countText) && (
             <div className={cn(
               "text-[10px] font-medium mt-0.5",
               countVisible ? "text-gray-400" : "text-gray-400 blur-sm select-none opacity-60"
             )}>
                {countText ? countText : (
                    <>
                        {Math.round(animatedCount)}{" "}
                        {Math.round(animatedCount) === 1 ? countLabel : `${countLabel}s`}
                    </>
                )}
             </div>
        )}
      </div>
      
      {restricted && (
        <LockOverlay className="bottom-2 right-4" />
      )}
    </div>
  );
}

/**
 * Helper to render an icon that could be either a JSX element or a component reference
 */
function IconRenderer({ icon, className }: { icon: any, className?: string }) {
  if (!icon) return null;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.render)) {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  return icon;
}
