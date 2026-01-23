import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { BenefitItem } from "./BenefitItem";
import { PlanBenefit } from "./planBenefits";

interface FutureBenefitsAccordionProps {
  benefits: PlanBenefit[];
}

export function FutureBenefitsAccordion({ benefits }: FutureBenefitsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (benefits.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500 font-semibold tracking-wider">
            Em Desenvolvimento
          </span>
        </div>
      </div>

      {/* Accordion Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">
              {benefits.length} recursos em desenvolvimento
            </p>
            <p className="text-xs text-gray-500">
              {isExpanded ? "Ocultar" : "Ver o que vem por aí"}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 pt-2">
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              text={benefit.text}
              description={benefit.description}
              included={true}
              badgeText="Em Breve"
            />
          ))}

          {/* Nota de Transparência */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              💡 <strong>Compromisso:</strong> Estes recursos estão em desenvolvimento ativo e serão liberados gradualmente nos próximos meses, sem custo adicional para assinantes do Profissional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
