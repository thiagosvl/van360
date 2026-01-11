import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DollarSign, Hand, Smartphone } from "lucide-react";

interface ComoFuncionaPixSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function ComoFuncionaPixSheet({
  open,
  onOpenChange,
  title = "Como pagar com PIX",
}: ComoFuncionaPixSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[24px] p-0 bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto md:max-w-md md:mx-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center pt-6 pb-4 px-4">
          {/* Illustration */}
          <div className="relative mb-4">
            {/* Background Circle */}
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative z-10">
              <div className="relative">
                {/* Hand */}
                <Hand className="w-12 h-12 text-blue-300 absolute -bottom-5 -right-2 rotate-[-15deg]" strokeWidth={1.5} />
                {/* Phone */}
                <div className="relative z-10 bg-white rounded-xl border-2 border-blue-100 p-1.5 shadow-sm rotate-[-5deg]">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            {/* Floating Coin */}
            <div className="absolute -top-1 -right-1 bg-yellow-100 p-1.5 rounded-full z-20 animate-bounce shadow-sm">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
          </div>

          <SheetHeader className="mb-4 text-center">
            <SheetTitle className="text-lg font-bold text-gray-900">
              {title}
            </SheetTitle>
          </SheetHeader>

          {/* Steps */}
          <div className="w-full space-y-4 mb-6">
            <div className="flex flex-col items-center text-center space-y-1">
              <span className="text-xs font-bold text-blue-600 tracking-wider">
                1º passo
              </span>
              <p className="text-gray-600 font-medium text-sm px-4">
                Copie o código que foi gerado
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-1 pt-2">
              <span className="text-xs font-bold text-blue-600 tracking-wider">
                2º passo
              </span>
              <p className="text-gray-600 font-medium text-sm px-4">
                Abra o aplicativo do seu banco e use a opção {" "}
                <span className="font-bold text-gray-900">Pix Copia e Cola</span>
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-1 pt-2">
              <span className="text-xs font-bold text-blue-600 tracking-wider">
                3º passo
              </span>
              <p className="text-gray-600 font-medium text-sm px-4">
                Cole o código, confirme o valor e faça o pagamento. Ele será
                confirmado na hora :)
              </p>
            </div>
          </div>

          {/* Button */}
          <Button
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-200"
            onClick={() => onOpenChange(false)}
          >
            Ok, entendi
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
