import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LimitHealthBarProps {
  current: number;
  max: number;
  label?: string;
  description?: string;
  showIncreaseLimit?: boolean;
  variant?: "full" | "compact";
  className?: string;
  onIncreaseLimit?: () => void;
  hideBelowThreshold?: number; // Porcentagem (0-100)
}

export function LimitHealthBar({
  current,
  max,
  label = "Limite",
  description,
  showIncreaseLimit = true,
  variant = "full",
  className,
  onIncreaseLimit,
  hideBelowThreshold = 0,
}: LimitHealthBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  // Se o uso for menor que o limite configurado (ex: 75%), não exibe nada
  if (percentage < hideBelowThreshold) {
    return null;
  }

  let colorClass = "bg-green-500";
  // Lógica de cores baseada em proximidade do limite
  if (current >= max) colorClass = "bg-red-500";
  else if (current >= max * 0.7) colorClass = "bg-yellow-500";

  const finalDescription = description;

  // Render Compact Variant
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "bg-white rounded-xl border border-gray-200 p-4 shadow-sm",
          className
        )}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <span
            className={cn(
              "text-sm font-bold",
              current >= max ? "text-red-600" : "text-gray-900"
            )}
          >
            {current} de {max}
          </span>
        </div>

        <Progress
          value={percentage}
          className="h-2 bg-gray-100"
          indicatorClassName={colorClass}
        />

        {showIncreaseLimit && onIncreaseLimit && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              onClick={onIncreaseLimit}
              className="h-auto p-0 text-primary bg-transparent hover:text-blue-800 border-0 hover:bg-transparent font-semibold text-xs"
            >
              Aumentar limite
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render Full Variant
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-4 shadow-sm",
        className
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <span
          className={cn(
            "text-sm font-bold",
            current >= max ? "text-red-600" : "text-gray-900"
          )}
        >
          {current} de {max}
        </span>
      </div>

      <Progress
        value={percentage}
        className="h-3 bg-gray-100"
        indicatorClassName={colorClass}
      />

      <div className="mt-2 flex flex-col md:flex-row md:justify-between items-center gap-2 md:gap-0 text-center md:text-left">
        <p className="text-xs text-gray-400 mt-1">{finalDescription}</p>
        {showIncreaseLimit && onIncreaseLimit && (
          <Button
            variant="outline"
            onClick={onIncreaseLimit}
            className="h-auto p-0 text-primary bg-transparent hover:text-blue-800 border-0 hover:bg-transparent font-semibold text-xs"
          >
            Aumentar limite
          </Button>
        )}
      </div>
    </div>
  );
}
