import { PLANO_PROFISSIONAL } from "@/constants";
import { Loader2 } from "lucide-react";
import { BenefitItem } from "./BenefitItem";
import { ExpansionSummary } from "./ExpansionSummary";
import { FranchiseTierSelector } from "./FranchiseTierSelector";
import { PLAN_BENEFITS } from "./planBenefits";

interface ProfissionalPlanContentProps {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculateProrata: (price: number) => { valorHoje: number };
  franquiaAtual: number;
  customHeadline?: string;
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
}: ProfissionalPlanContentProps) {
  return (
    <div className="px-6 pt-6 space-y-6 m-0 focus-visible:ring-0 outline-none">
      {availableFranchiseOptions && availableFranchiseOptions.length > 0 ? (
        <>
          {/* 1. Header (New) */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {customHeadline || (salesContext === "expansion"
                ? "Precisa de mais espaço para crescer?"
                : "Você quer apenas dirigir?")}
            </h3>
          </div>

          {/* 2. SELETOR (Horizontal Scroll - Mobile First) */}
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {salesContext === "expansion"
                  ? "NOVA CAPACIDADE"
                  : "QUANTIDADE DE PASSAGEIROS"}
              </span>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Arraste para o lado
              </span>
            </div>

            <FranchiseTierSelector
              availableOptions={availableFranchiseOptions}
              salesContext={salesContext}
              isCustomQuantityMode={isCustomQuantityMode}
              setIsCustomQuantityMode={setIsCustomQuantityMode}
              manualQuantity={manualQuantity}
              setManualQuantity={setManualQuantity}
              selectedTierId={selectedTierId}
              setSelectedTierId={setSelectedTierId}
              currentTierOption={currentTierOption}
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

              // Visão Padrão (Benefícios)
              return (
                <div className="space-y-6">
                  {PLAN_BENEFITS.map((benefit, index) => {
                    const isIncluded =
                      benefit.enabled_plans.includes(PLANO_PROFISSIONAL);
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
