import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PassengerLimitHealthBarProps {
  current: number;
  max: number;
  label?: string;
  description?: string;
  showIncreaseLimit?: boolean;
  variant?: "full" | "compact";
  className?: string;
  onIncreaseLimit?: () => void;
}

export function PassengerLimitHealthBar({ 
  current, 
  max,
  label = "Limite de Passageiros",
  description,
  showIncreaseLimit = true,
  variant = "full",
  className,
  onIncreaseLimit
}: PassengerLimitHealthBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  let colorClass = "bg-green-500";
  if (current >= max) colorClass = "bg-red-500";
  else if (current >= max - 1) colorClass = "bg-yellow-500";

  const defaultDescription = current >= max 
    ? "Você atingiu o limite." 
    : `Você ainda pode cadastrar ${max - current} ${max - current === 1 ? "passageiro" : "passageiros"}.`;

  const finalDescription = description ?? defaultDescription;

  if (variant === "compact") {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-200 p-4 shadow-sm", className)}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
          <span className={cn("text-sm font-bold", 
            current >= max ? "text-red-600" : "text-gray-900"
          )}>
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

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
        <span className={cn("text-sm font-bold", 
          current >= max ? "text-red-600" : "text-gray-900"
        )}>
          {current} de {max}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-3 bg-gray-100" 
        indicatorClassName={colorClass}
      />
      
      <div className="mt-2 flex flex-col md:flex-row md:justify-between items-center gap-2 md:gap-0 text-center md:text-left">
        <p className="text-xs text-gray-400 mt-1">
          {finalDescription}
        </p>
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
