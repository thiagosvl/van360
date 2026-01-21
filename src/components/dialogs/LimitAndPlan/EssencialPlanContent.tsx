import { PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";
import { Zap } from "lucide-react";
import { BenefitItem } from "./BenefitItem";
import { PLAN_BENEFITS } from "./planBenefits";

interface EssencialPlanContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planoEssencialData: any;
  setActiveTab: (tab: string) => void;
  customHeadline?: string;
}

export function EssencialPlanContent({
  planoEssencialData,
  setActiveTab,
  customHeadline,
}: EssencialPlanContentProps) {
  return (
    <div className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none">
      {/* 1. Header (New) */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {customHeadline || "Comece a organizar sua frota hoje mesmo"}
        </h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">
          CONHEÇA OS BENEFÍCIOS
        </p>
      </div>

      {/* 2. Benefits List (Standardized) */}
      <div className="space-y-6">
        {PLAN_BENEFITS.map((benefit, index) => {
          const isIncluded = benefit.enabled_plans.includes(PLANO_ESSENCIAL);
          return (
            <BenefitItem
              key={index}
              text={benefit.text}
              description={benefit.description}
              included={isIncluded}
              badgeText={benefit.soon ? "Em Breve" : undefined}
            />
          );
        })}
      </div>

      {/* 3. Upsell Trigger (Banner Button) - Clean Style */}
      <button
        onClick={() => setActiveTab(PLANO_PROFISSIONAL)}
        className="w-full group relative overflow-hidden bg-white hover:bg-gray-50 border border-gray-200 hover:border-violet-200 rounded-2xl p-4 transition-all duration-300 text-left shadow-sm hover:shadow-md"
      >
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
              Quer apenas dirigir?
            </p>
            <p className="text-xs text-gray-500 group-hover:text-violet-600 transition-colors font-medium">
              Conheça o Plano Profissional <span aria-hidden="true">&rarr;</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center text-gray-400 group-hover:text-violet-600 transition-colors">
             <Zap className="w-5 h-5 fill-current" />
          </div>
        </div>
      </button>



      {/* Espaçador */}
      <div className="h-4 sm:h-0" />
    </div>
  );
}
