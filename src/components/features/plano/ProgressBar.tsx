import { LucideAlertTriangle } from "lucide-react";

const ProgressBar = ({
  label,
  current,
  max,
  primaryColor = "primary",
}: {
  label: string;
  current: number;
  max: number | null;
  primaryColor?: string;
}) => {
  // Calcular porcentagem (não pode passar de 100%)
  const percentage = max && max > 0 ? Math.min(100, (current / max) * 100) : 0;
  
  // Considerar "no limite" quando current >= max (não apenas quando excede)
  const isAtLimit = max !== null && max > 0 && current >= max;

  let progressText;
  if (max === null || max === 0) {
    progressText = `Ilimitado`;
  } else {
    progressText = `${current}/${max}`;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span className={isAtLimit ? "text-red-600 font-bold" : ""}>
          {progressText}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isAtLimit ? "bg-red-500" : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
          <LucideAlertTriangle className="w-3 h-3" />
          Limite atingido.
        </p>
      )}
    </div>
  );
};
export default ProgressBar;
