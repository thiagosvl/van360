import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PassengerLimitHealthBarProps {
  current: number;
  max: number;
}

export function PassengerLimitHealthBar({ current, max }: PassengerLimitHealthBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  let colorClass = "bg-green-500";
  if (current >= max) colorClass = "bg-red-500";
  else if (current >= max - 1) colorClass = "bg-yellow-500";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Limite de Passageiros
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
      
      <div className="mt-3 flex flex-col md:flex-row md:justify-between items-center gap-2 md:gap-0 text-center md:text-left">
        <p className="text-xs text-gray-500">
          {current >= max 
            ? "Você atingiu o limite do plano Gratuito." 
            : "Cadastre mais passageiros para crescer seu negócio."}
        </p>
        <Link to="/planos">
          <Button variant="outline" className="h-auto p-0 text-primary bg-transparent hover:text-blue-800 border-0 hover:bg-transparent font-semibold text-xs">
            Aumentar limite
          </Button>
        </Link>
      </div>
    </div>
  );
}
