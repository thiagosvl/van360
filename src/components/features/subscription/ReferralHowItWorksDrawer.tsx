import { HelpCircle, Link2, Tag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ReferralHowItWorksDrawerProps {
  bonusDaysPerReferral?: number;
  triggerClassName?: string;
}

export function ReferralHowItWorksDrawer({
  bonusDaysPerReferral = 30,
  triggerClassName,
}: ReferralHowItWorksDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors bg-[#f5f5f5] hover:bg-[#e5e5e5]/60 px-3 py-1.5 rounded-[18px] cursor-pointer",
            triggerClassName
          )}
        >
          <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-[#737373]" strokeWidth={1.5} />
          Como funciona?
        </button>
      </DrawerTrigger>
      <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-xs overflow-hidden z-[100]">
        <DrawerHeader className="text-left px-6 pt-6 pb-2">
          <DrawerTitle className="font-headline font-semibold text-[#0a0a0a] text-xl leading-tight tracking-tight">
            Como funciona o Indique e Ganhe?
          </DrawerTitle>
          <DrawerDescription className="text-xs font-normal text-[#737373] mt-1 text-left">
            Vantagem para quem é indicado e recompensa para você!
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-2 overflow-y-auto space-y-3">
          <div className="p-3.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-[14px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary font-semibold">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-[#0a0a0a] leading-tight">
                1. Envie seu link exclusivo
              </h5>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Copie e compartilhe seu link de indicação com outros motoristas.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-[14px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary font-semibold">
              <Tag className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-[#0a0a0a] leading-tight">
                2. O indicado se cadastra e garante o desconto
              </h5>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Ao criar a conta pelo seu link, o motorista indicado garante um desconto especial na assinatura.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-[14px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary font-semibold">
              <Gift className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-[#0a0a0a] leading-tight">
                3. Você ganha +{bonusDaysPerReferral} dias grátis!
              </h5>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                No momento em que ele assinar, você ganha +{bonusDaysPerReferral} dias grátis na sua mensalidade. Quanto mais indicar, mais acumula!
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-[calc(1.5rem+var(--safe-area-bottom))] pt-3">
          <DrawerTrigger asChild>
            <Button className="w-full h-11 rounded-[18px] bg-primary hover:bg-primary/90 text-white font-medium text-sm cursor-pointer shadow-xs active:scale-95">
              Entendi
            </Button>
          </DrawerTrigger>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
