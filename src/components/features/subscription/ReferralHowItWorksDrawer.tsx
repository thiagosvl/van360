import { HelpCircle, Link2, Tag, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
          className={
            triggerClassName ||
            "flex items-center justify-center text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full mb-4"
          }
        >
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-500" strokeWidth={2} />
          Como funciona?
        </button>
      </DrawerTrigger>
      <DrawerContent className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl overflow-hidden z-[100]">
        <DrawerHeader className="text-left px-6 pt-6 pb-2">
          <DrawerTitle className="font-headline font-black text-[#0b1a2e] text-xl leading-tight">
            Como funciona o Indique e Ganhe?
          </DrawerTitle>
          <DrawerDescription className="text-xs font-medium text-slate-500 mt-1 text-left">
            Vantagem para quem é indicado e recompensa para você!
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-2 overflow-y-auto space-y-3 scrollbar-hide">
          {/* Passo 1 */}
          <div className="p-3.5 rounded-2xl border border-emerald-100/80 bg-emerald-50/50 flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-200/50 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-slate-900 leading-tight">
                1. Envie seu link exclusivo
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Copie e compartilhe seu link de indicação com outros motoristas.
              </p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="p-3.5 rounded-2xl border border-emerald-100/80 bg-emerald-50/50 flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-200/50 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-slate-900 leading-tight">
                2. O indicado se cadastra e garante o desconto
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Ao criar a conta pelo seu link, o motorista indicado garante um <strong className="text-emerald-700">desconto especial</strong> na assinatura.
              </p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="p-3.5 rounded-2xl border border-emerald-100/80 bg-emerald-50/50 flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-200/50 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-slate-900 leading-tight">
                3. Você ganha +{bonusDaysPerReferral} dias grátis!
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                No momento em que ele assinar, você ganha <strong className="text-emerald-700 font-bold">+{bonusDaysPerReferral} dias grátis</strong> na sua mensalidade. Quanto mais indicar, mais acumula!
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3">
          <DrawerTrigger asChild>
            <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm">
              Entendi
            </Button>
          </DrawerTrigger>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
