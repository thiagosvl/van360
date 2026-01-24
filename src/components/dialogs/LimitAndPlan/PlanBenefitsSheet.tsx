import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { CheckCircle2 } from "lucide-react";
import { AvailableBenefitsList } from "./AvailableBenefitsList";
import { FutureBenefitsAccordion } from "./FutureBenefitsAccordion";
import { PlanBenefit } from "./planBenefits";

interface PlanBenefitsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBenefits: PlanBenefit[];
  futureBenefits: PlanBenefit[];
  showSocialProof: boolean;
}

export function PlanBenefitsSheet({
  open,
  onOpenChange,
  availableBenefits,
  futureBenefits,
  showSocialProof,
}: PlanBenefitsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] p-0 flex flex-col gap-0 border-t-0 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.3)]"
      >
        <div className="shrink-0 p-6 pb-2 relative border-b border-dashed border-gray-100">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full" />
          
          <SheetHeader className="mt-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <SheetTitle className="text-xl font-bold text-gray-900">
                O que está incluso?
              </SheetTitle>
            </div>
            <SheetDescription className="text-gray-500 text-sm">
              Confira todos os recursos detalhados do Plano Profissional.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Benefícios Disponíveis */}
          <AvailableBenefitsList
            benefits={availableBenefits}
            showSocialProof={showSocialProof}
          />

          {/* Benefícios Futuros */}
          {futureBenefits.length > 0 && (
            <FutureBenefitsAccordion benefits={futureBenefits} />
          )}

          {/* Espaço extra para scroll */}
          <div className="h-10" />
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <Button 
            className="w-full h-12 rounded-xl text-base font-bold bg-gray-100 text-gray-900 hover:bg-gray-200"
            onClick={() => onOpenChange(false)}
          >
            Entendi
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
