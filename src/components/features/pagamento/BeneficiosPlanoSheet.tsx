import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Check, Star } from "lucide-react";

interface BeneficiosPlanoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  benefits: string[];
}

export function BeneficiosPlanoSheet({
  open,
  onOpenChange,
  planName,
  benefits,
}: BeneficiosPlanoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[24px] p-0 bg-white border-none shadow-2xl max-h-[85vh] overflow-y-auto md:max-w-md md:mx-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full pt-6 pb-4 px-6">
          <SheetHeader className="mb-6 text-left">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                 <Star className="w-6 h-6 text-blue-600 fill-current" />
             </div>
            <SheetTitle className="text-2xl font-bold text-gray-900 leading-tight">
              Tudo o que você ganha no {planName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto mb-6">
            {benefits && benefits.length > 0 ? (
                benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={2.5} />
                    </div>
                    <span className="text-gray-700 font-medium leading-snug">{benefit}</span>
                </div>
                ))
            ) : (
                <p className="text-gray-500 text-center py-4">Benefícios sendo carregados...</p>
            )}
          </div>

          {/* Button */}
          <Button
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-base shadow-lg"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
