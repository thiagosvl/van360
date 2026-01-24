import { PlanCapacitySelector } from "@/components/common/PlanCapacitySelector";
import {
  PLANO_PROFISSIONAL,
  QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO,
} from "@/constants";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { AvailableBenefitsList } from "./AvailableBenefitsList";
import { ExpansionSummary } from "./ExpansionSummary";
import { FutureBenefitsAccordion } from "./FutureBenefitsAccordion";
import { PLAN_BENEFITS } from "./planBenefits";

interface ProfissionalPlanContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableFranchiseOptions: any[];
  salesContext: string;
  isCustomQuantityMode: boolean;
  setIsCustomQuantityMode: (v: boolean) => void;
  manualQuantity: number | string;
  setManualQuantity: (v: number | string) => void;
  selectedTierId: string | number | null;
  setSelectedTierId: (id: string | number | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentTierOption: any;
  customPrice: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planos: any[];
  calculateProrata: (price: number) => { valorHoje: number };
  franquiaAtual: number;
  customHeadline?: string;
  isInTrial?: boolean;
  minAllowedQuantity: number;
}

export function ProfissionalPlanContent({
  availableFranchiseOptions,
  salesContext,
  isCustomQuantityMode,
  setIsCustomQuantityMode,
  manualQuantity,
  setManualQuantity,
  selectedTierId,
  setSelectedTierId,
  currentTierOption,
  customPrice,
  planos,
  calculateProrata,
  franquiaAtual,
  customHeadline,
  isInTrial = false,
  minAllowedQuantity,
}: ProfissionalPlanContentProps) {
  const availableBenefits = PLAN_BENEFITS.filter(
    (b) => b.enabled_plans.includes(PLANO_PROFISSIONAL) && !b.soon
  );
  const futureBenefits = PLAN_BENEFITS.filter(
    (b) => b.enabled_plans.includes(PLANO_PROFISSIONAL) && b.soon
  );

  // Memoize options (prevent loop)
  const capacityOptions = useMemo(() => availableFranchiseOptions.map((opt) => ({
    id: opt.id || `temp_${opt.quantidade}`,
    quantity: opt.quantidade || 0,
    isCustom: opt.isCustom,
    label: opt.label,
  })), [availableFranchiseOptions]);

  // Stable handlers (prevent loop)
  const handleSelectOption = useCallback((id: string | number | undefined, source?: 'click' | 'snap') => {
      if (id === undefined) {
        if (selectedTierId) setSelectedTierId(null);
      } else {
        if (selectedTierId !== id) {
          setSelectedTierId(id);
          
          // Only close custom mode interactions if user manually clicked a tier
          // For 'snap' (typing), we keep the input/custom mode active
          if (source !== 'snap') {
             setIsCustomQuantityMode(false);
          }
        }
      }
  }, [selectedTierId, setSelectedTierId, setIsCustomQuantityMode]);

  const handleCustomChange = useCallback((val: string) => {
      setManualQuantity(val);
      if (val && !isCustomQuantityMode) {
        setIsCustomQuantityMode(true);
      }
  }, [setManualQuantity, isCustomQuantityMode, setIsCustomQuantityMode]);

  return (
    <div className="px-6 pt-6 space-y-6 m-0 focus-visible:ring-0 outline-none">
      {(availableFranchiseOptions && availableFranchiseOptions.length > 0) || isCustomQuantityMode ? (
        <>
          {/* 1. Header Contextualizado */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {customHeadline || (
                salesContext === "expansion"
                  ? "Aumente sua Capacidade"
                  : salesContext === "upgrade_auto"
                  ? "Pare de cobrar manualmente. Automatize tudo."
                  : "Você quer apenas dirigir?"
              )}
            </h3>
            <p className="text-sm text-gray-600">
              {salesContext === "expansion"
                ? "Ajuste o limite de passageiros da sua franquia de cobrança."
                : salesContext === "upgrade_auto"
                ? "Reduza inadimplência em 80% e recupere 15+ horas por mês."
                : "Automatize cobranças, reduza inadimplência e recupere seu tempo."}
            </p>
          </div>

          {/* 2. SELETOR (Horizontal Scroll - Mobile First) */}
          <div className="space-y-3 px-1 py-2">
            <PlanCapacitySelector
              options={capacityOptions}
              selectedOptionId={selectedTierId}
              onSelectOption={handleSelectOption}
              customQuantity={manualQuantity}
              onCustomQuantityChange={handleCustomChange}
              minCustomQuantity={minAllowedQuantity}
              maxCustomQuantity={QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO}
              salesContext={salesContext as any}
            />
          </div>



          {/* 3. INFO DINÂMICA: RESUMO FINANCEIRO (Expansão) OU BENEFÍCIOS (Migração) */}
          <div className="space-y-6 pt-2">
            {(() => {
              // Cálculo do Preço Selecionado para Prorata
              let price = 0;
              if (currentTierOption?.isCustom && customPrice) {
                price = customPrice;
              } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const officialPlan = planos?.find(
                  (p: any) => p.id === currentTierOption?.id
                );
                if (officialPlan) {
                  price = officialPlan.promocao_ativa
                    ? Number(officialPlan.preco_promocional)
                    : Number(officialPlan.preco);
                }
              }

              const prorata = calculateProrata(price);

              if (salesContext === "expansion") {
                return (
                  <ExpansionSummary
                    currentLimit={franquiaAtual}
                    newLimit={currentTierOption?.quantidade || 0}
                    nextMonthlyPrice={price}
                    proRataAmount={prorata.valorHoje}
                  />
                );
              }

              // Visão Padrão (Benefícios Separados)
              return (
                <div className="space-y-6">
                  {/* Benefícios Disponíveis */}
                  <AvailableBenefitsList
                    benefits={availableBenefits}
                    showSocialProof={isInTrial || salesContext === "upgrade_auto"}
                  />

                  {/* Benefícios Futuros (Accordion) */}
                  {futureBenefits.length > 0 && (
                    <FutureBenefitsAccordion benefits={futureBenefits} />
                  )}
                </div>
              );
            })()}
          </div>


        </>
      ) : (
        <div className="h-40 flex items-center justify-center flex-col gap-3">
          <Loader2 className="animate-spin text-gray-300 w-8 h-8" />
          <p className="text-sm text-gray-400">Carregando planos...</p>
        </div>
      )}

      {/* Espaçador */}
      <div className="h-4 sm:h-0" />
    </div>
  );
}
