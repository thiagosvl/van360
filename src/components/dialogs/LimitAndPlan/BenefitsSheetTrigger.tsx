import { CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PlanBenefit } from "./planBenefits";
import { PlanBenefitsSheet } from "./PlanBenefitsSheet";

interface BenefitsSheetTriggerProps {
  availableBenefits: PlanBenefit[];
  futureBenefits: PlanBenefit[];
  showSocialProof: boolean;
}

export function BenefitsSheetTrigger({
  availableBenefits,
  futureBenefits,
  showSocialProof,
}: BenefitsSheetTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-4 transition-all hover:border-violet-300 hover:shadow-md active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-gray-900 group-hover:text-violet-700">
                O que está incluso?
              </span>
              <span className="block text-xs text-gray-500 group-hover:text-violet-600/80">
                Veja os {availableBenefits.length + futureBenefits.length} benefícios detalhados
              </span>
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-400" />
        </div>
      </button>

      <PlanBenefitsSheet 
        open={isOpen}
        onOpenChange={setIsOpen}
        availableBenefits={availableBenefits}
        futureBenefits={futureBenefits}
        showSocialProof={showSocialProof}
      />
    </>
  );
}
