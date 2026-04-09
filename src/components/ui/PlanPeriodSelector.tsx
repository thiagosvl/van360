import { SubscriptionIdentifer } from "@/types/enums";
import { cn } from "@/lib/utils";
import { SaaSPlan } from "@/types/subscription";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlanPeriodSelectorProps {
  value: SubscriptionIdentifer;
  onChange: (value: SubscriptionIdentifer) => void;
  className?: string;
  plans?: SaaSPlan[];
  isPromotionActive?: boolean;
}

export function PlanPeriodSelector({ value, onChange, className, plans, isPromotionActive = false }: PlanPeriodSelectorProps) {
  const yearlyPlan = plans?.find(p => p.identificador === SubscriptionIdentifer.YEARLY || (p as any).identificador === SubscriptionIdentifer.YEARLY);
  const monthlyPlan = plans?.find(p => p.identificador === SubscriptionIdentifer.MONTHLY || (p as any).identificador === SubscriptionIdentifer.MONTHLY);

  const getPriceLabel = (period: SubscriptionIdentifer) => {
    if (period === SubscriptionIdentifer.YEARLY) {
      return yearlyPlan ? `${SubscriptionUtils.formatCurrency(SubscriptionUtils.getMonthlyEquivalent(yearlyPlan, isPromotionActive))}/mês` : "Melhor Valor";
    }
    const price = monthlyPlan ? SubscriptionUtils.getFinalPrice(monthlyPlan, isPromotionActive) : 0;
    return monthlyPlan ? `${SubscriptionUtils.formatCurrency(price)}/mês` : "Flexível";
  };

  return (
    <div className={cn("bg-slate-200/50 p-1 rounded-[1.25rem] w-full", className)}>
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as SubscriptionIdentifer)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full h-[52px] bg-transparent p-0 gap-1 mt-0">
          <TabsTrigger
            value={SubscriptionIdentifer.YEARLY}
            className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] flex flex-col gap-0.5"
          >
            <div className="flex items-center gap-1.5">
              Anual
              <span className="px-1.5 py-0.5 rounded-lg bg-orange-100 text-orange-600 text-[8px] font-black uppercase tracking-tighter">
                -20%
              </span>
            </div>
            <span className="text-[10px] opacity-60 font-medium">
              {getPriceLabel(SubscriptionIdentifer.YEARLY)}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value={SubscriptionIdentifer.MONTHLY}
            className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] flex flex-col gap-0.5"
          >
            Mensal
            <span className="text-[10px] opacity-60 font-medium">
              {getPriceLabel(SubscriptionIdentifer.MONTHLY)}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
