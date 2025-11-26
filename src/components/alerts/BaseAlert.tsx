import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "warning" | "success" | "danger" | "neutral";

const VARIANT_STYLES: Record<
  AlertVariant,
  {
    container: string;
    icon: string;
    border: string;
    highlight: string;
  }
> = {
  info: {
    container: "bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    border: "border-sky-200",
    highlight: "text-sky-700",
  },
  warning: {
    container: "bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    border: "border-amber-200",
    highlight: "text-amber-700",
  },
  success: {
    container: "bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    border: "border-emerald-200",
    highlight: "text-emerald-700",
  },
  danger: {
    container: "bg-red-50 text-red-900",
    icon: "text-red-600",
    border: "border-red-200",
    highlight: "text-red-700",
  },
  neutral: {
    container: "bg-muted text-foreground",
    icon: "text-muted-foreground",
    border: "border-border",
    highlight: "text-foreground",
  },
};

export type BaseAlertAction = {
  render: ReactNode;
};

export interface BaseAlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  highlight?: ReactNode;
  icon?: React.ElementType;
  actions?: ReactNode;
  actionsClassName?: string;
  className?: string;
  contentClassName?: string;
  border?: boolean;
  children?: ReactNode;
  layout?: "vertical" | "horizontal";
  onClose?: () => void;
  closeLabel?: string;
}

export function getAlertStyles(variant: AlertVariant = "info") {
  return VARIANT_STYLES[variant];
}

export const BaseAlert = ({
  variant = "info",
  title,
  description,
  highlight,
  icon: Icon,
  actions,
  actionsClassName,
  className,
  contentClassName,
  border = true,
  children,
  layout = "horizontal",
  onClose,
  closeLabel = "Fechar alerta",
}: BaseAlertProps) => {
  const styles = VARIANT_STYLES[variant];
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={cn(
        "rounded-lg p-4 flex flex-col gap-3 shadow-sm relative",
        styles.container,
        border && `border ${styles.border}`,
        className
      )}
    >
      {onClose && (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children ? (
        children
      ) : (
        <div
          className={cn(
            "flex flex-col gap-3",
            isHorizontal && "sm:flex-row sm:items-start sm:justify-between",
            contentClassName
          )}
        >
          <div className="flex items-start gap-3 flex-1">
            {Icon && <Icon className={cn("w-6 h-6 flex-shrink-0", styles.icon)} />}
            <div>
              {title && <div className="font-semibold text-base">{title}</div>}
              {description && (
                <p className="text-sm text-foreground/80 mt-0.5">{description}</p>
              )}
              {highlight && (
                <p className={cn("text-xs font-semibold mt-1", styles.highlight)}>
                  {highlight}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div
              className={cn(
                "flex-shrink-0 flex gap-2 flex-col sm:flex-row sm:items-center",
                actionsClassName
              )}
            >
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

BaseAlert.displayName = "BaseAlert";

export default BaseAlert;

