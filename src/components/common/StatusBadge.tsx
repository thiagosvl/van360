import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusText } from "@/utils/formatters";

interface StatusBadgeProps {
  /**
   * Status pode ser booleano (Ativo/Inativo) ou string (Pago/Pendente/Atrasado)
   */
  status: boolean | string;
  
  /**
   * Data de vencimento (apenas para status de cobrança)
   */
  dataVencimento?: string | Date;

  /**
   * Define explicitamente labels customizadas para true/false
   */
  trueLabel?: string;
  falseLabel?: string;

  className?: string;
}

export function StatusBadge({
  status,
  dataVencimento,
  trueLabel = "Ativo",
  falseLabel = "Inativo", // Em alguns contextos pode ser "Desativada" (Escola)
  className,
}: StatusBadgeProps) {

  // Caso 1: Status Booleano (Ativo / Inativo)
  if (typeof status === "boolean") {
    return status ? (
      <Badge
        variant="outline"
        className={cn(
          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 font-medium",
          className
        )}
      >
        {trueLabel}
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className={cn(
          "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium",
          className
        )}
      >
        {falseLabel}
      </Badge>
    );
  }

  // Caso 2: Status String (Cobrança)
  const colorClass = getStatusColor(status, dataVencimento ? dataVencimento.toString() : "");
  const text = getStatusText(status, dataVencimento ? dataVencimento.toString() : "");

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", colorClass, className)}
    >
      {text}
    </Badge>
  );
}
