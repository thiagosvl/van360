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
        <div className="flex flex-col h-full pt-5 pb-5 px-5">
          <SheetHeader className="mb-5 text-left">
             <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                 <Star className="w-5 h-5 text-blue-600 fill-current" />
             </div>
            <SheetTitle className="text-xl font-bold text-gray-900 leading-tight">
              Tudo o que você ganha no {planName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-2 overflow-y-auto mb-5">
            {benefits && benefits.length > 0 ? (
                benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-700" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-gray-700 font-medium leading-snug">{benefit}</span>
                </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">Benefícios sendo carregados...</p>
            )}
          </div>

          {/* Button */}
          <Button
            className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm shadow-lg"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
