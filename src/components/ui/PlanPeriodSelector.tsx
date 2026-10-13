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
    <div className={cn("bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full", className)}>
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as SubscriptionIdentifer)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0 border-0">
          <TabsTrigger
            value={SubscriptionIdentifer.YEARLY}
            className="rounded-[18px] h-full font-headline font-semibold text-xs sm:text-[13px] transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] flex flex-col gap-0.5 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              Anual
              <span className="px-1.5 py-0.5 rounded-[18px] bg-amber-500/15 text-amber-700 text-[9px] font-bold uppercase tracking-tight border border-amber-500/20">
                -20%
              </span>
            </div>
            <span className="text-[10px] opacity-70 font-normal">
              {getPriceLabel(SubscriptionIdentifer.YEARLY)}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value={SubscriptionIdentifer.MONTHLY}
            className="rounded-[18px] h-full font-headline font-semibold text-xs sm:text-[13px] transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] flex flex-col gap-0.5 cursor-pointer"
          >
            Mensal
            <span className="text-[10px] opacity-70 font-normal">
              {getPriceLabel(SubscriptionIdentifer.MONTHLY)}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
