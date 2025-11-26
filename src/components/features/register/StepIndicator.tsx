import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  requiresPayment: boolean;
}

export const StepIndicator = ({
  currentStep,
  steps,
  requiresPayment,
}: StepIndicatorProps) => {
  return (
    <div
      className={cn(
        "flex items-start w-full mx-auto mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4"
      )}
    >
      {steps.map((name, idx) => {
        const num = idx + 1;
        // Riscar o step de Pagamento se não for necessário
        const isDisabledStep =
          name === "Pagamento" && !requiresPayment;
        const isCompleted = num < currentStep;
        const isActive = num === currentStep;
        const isPending = num > currentStep;
        const isFirst = idx === 0;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={num}>
            {/* Container do step (círculo + label) */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Círculo do step */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full font-bold border-2 transition-all duration-300",
                    // Mobile: menor, Desktop: maior - mesmo tamanho para todos
                    "w-6 h-6 sm:w-8 sm:h-8",
                    // Cores e estados
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-200"
                      : isCompleted
                      ? "bg-blue-100 text-blue-600 border-blue-600"
                      : "bg-white text-gray-400 border-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <span className="text-xs sm:text-sm">{num}</span>
                  )}
                </div>
              </div>

              {/* Label diretamente abaixo do círculo */}
              <span
                className={cn(
                  "mt-1 sm:mt-1.5 text-center text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                  isActive
                    ? "text-blue-600 font-semibold"
                    : isCompleted
                    ? "text-blue-600"
                    : "text-gray-400",
                  isDisabledStep && "opacity-60"
                )}
              >
                {isDisabledStep ? "Comece a usar" : name}
              </span>
            </div>

            {/* Linha conectora - só renderiza se não for o último step */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 transition-all duration-500 ease-in-out self-center",
                  // Mobile: mais espessa, Desktop: normal
                  "h-1 sm:h-0.5",
                  // Padding mínimo nas pontas para não colar nos círculos
                  isFirst ? "ml-2 sm:ml-3" : "mx-2 sm:mx-3",
                  // Cores baseadas no estado
                  isCompleted
                    ? "bg-blue-600"
                    : isActive
                    ? "bg-gradient-to-r from-blue-600 to-gray-300"
                    : "bg-gray-300",
                  // Se o próximo step (Pagamento) está desabilitado, mostrar linha riscada
                  steps[idx + 1] === "Pagamento" && !requiresPayment && "opacity-60"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

