import { cn } from "@/lib/utils";

interface BlurredValueProps {
  value: number | string;
  visible: boolean;
  type?: "currency" | "number" | "percent" | "text";
  className?: string;
  blurIntensity?: string;
}

export function BlurredValue({
  value,
  visible,
  type = "currency",
  className,
  blurIntensity = "blur-sm",
}: BlurredValueProps) {
  if (visible) {
    if (type === "currency" && typeof value === "number") {
      // Tratar NaN e valores inválidos
      const numValue = isNaN(value) || !isFinite(value) ? 0 : value;
      return (
        <span className={className}>
          {numValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      );
    }
    if (type === "percent" && typeof value === "number") {
      // Tratar NaN e valores inválidos
      const numValue = isNaN(value) || !isFinite(value) ? 0 : value;
      return <span className={className}>{numValue.toFixed(1)}%</span>;
    }
    // Tratar objetos e valores inválidos
    if (typeof value === "object" && value !== null) {
      return <span className={className}>-</span>;
    }
    return <span className={className}>{String(value ?? "-")}</span>;
  }

  // Logic for hidden state (blurred)
  // We display "0" or a fake value behind the blur
  let displayValue = "0";

  if (type === "currency") {
    displayValue = "R$ 0,00";
  } else if (type === "percent") {
    displayValue = "0%";
  } else if (type === "text") {
    displayValue = "Conteúdo Bloqueado";
  }

  return (
    <span
      className={cn(
        "select-none opacity-60 transition-all duration-300",
        blurIntensity,
        className
      )}
      title="Disponível no plano Premium"
    >
      {displayValue}
    </span>
  );
}
