import { PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";
import { Zap } from "lucide-react";
import { AvailableBenefitsList } from "./AvailableBenefitsList";
import { FutureBenefitsAccordion } from "./FutureBenefitsAccordion";
import { PLAN_BENEFITS } from "./planBenefits";
import { UpsellBanner } from "./UpsellBanner";

interface EssencialPlanContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planoEssencialData: any;
  setActiveTab: (tab: string) => void;
  customHeadline?: string;
  isInTrial?: boolean;
  profissionalPrice?: number;
}

export function EssencialPlanContent({
  planoEssencialData,
  setActiveTab,
  customHeadline,
  isInTrial = false,
  profissionalPrice,
}: EssencialPlanContentProps) {
  const essencialPrice = planoEssencialData?.promocao_ativa
    ? Number(planoEssencialData.preco_promocional)
    : Number(planoEssencialData.preco);

  // Separar benefícios disponíveis vs em breve
  const availableBenefits = PLAN_BENEFITS.filter(
    (b) => b.enabled_plans.includes(PLANO_ESSENCIAL) && !b.soon
  );
  const futureBenefits = PLAN_BENEFITS.filter(
    (b) => b.enabled_plans.includes(PLANO_ESSENCIAL) && b.soon
  );

  return (
    <div className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none">
      {/* 1. Header Contextualizado */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {customHeadline || "Organize sua frota e controle financeiro"}
        </h3>
        <p className="text-sm text-gray-600">
          Gerencie passageiros, rotas, escolas e despesas em um só lugar.
        </p>
      </div>

      {/* 2. Benefits List Separados */}
      <div className="space-y-6">
        {/* Benefícios Disponíveis */}
        <AvailableBenefitsList
          benefits={availableBenefits}
          showSocialProof={false}
        />

        {/* Benefícios Futuros (Accordion) */}
        {futureBenefits.length > 0 && (
          <FutureBenefitsAccordion benefits={futureBenefits} />
        )}
      </div>

      {/* 3. Upsell Trigger - Contextual */}
      {isInTrial && profissionalPrice && essencialPrice ? (
        <UpsellBanner
          currentPrice={essencialPrice}
          upgradePrice={profissionalPrice}
          onUpgrade={() => setActiveTab(PLANO_PROFISSIONAL)}
          isInTrial={isInTrial}
        />
      ) : (
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
      )}



      {/* Espaçador */}
      <div className="h-4 sm:h-0" />
    </div>
  );
}
