import { ChevronRight, Loader2 } from "lucide-react";
import { BenefitItem } from "./BenefitItem";
import { ExpansionSummary } from "./ExpansionSummary";
import { FranchiseTierSelector } from "./FranchiseTierSelector";
import { PriceDisplay } from "./PriceDisplay";

interface ProfissionalPlanContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableFranchiseOptions: any[];
  salesContext: string;
  isCustomQuantityMode: boolean;
  setIsCustomQuantityMode: (v: boolean) => void;
  manualQuantity: number;
  setManualQuantity: (v: number) => void;
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
  setIsBenefitsOpen: (open: boolean) => void;
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
  setIsBenefitsOpen,
}: ProfissionalPlanContentProps) {
  return (
    <div className="px-6 pt-3 space-y-6 m-0 focus-visible:ring-0 outline-none">
      {availableFranchiseOptions && availableFranchiseOptions.length > 0 ? (
        <>
          {/* 1. SELETOR (Segmented Control Refined) */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {salesContext === "expansion"
                  ? "Nova Capacidade Desejada"
                  : "Tamanho da sua Frota"}
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

          {/* 2. HERO SECTION (Preço) */}
          <div className="text-center py-2 space-y-0.5 min-h-[90px] flex flex-col justify-center transition-all duration-300">
            <PriceDisplay
              currentTierOption={currentTierOption}
              customPrice={customPrice}
              planos={planos}
            />
          </div>

          {/* 3. INFO DINÂMICA: RESUMO FINANCEIRO (Expansão) OU BENEFÍCIOS (Migração) */}
          <div className="space-y-4 pt-2">
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
                <div className="space-y-2">
                  <BenefitItem
                    text={`Cobranças Automáticas para até ${currentTierOption?.quantidade} Passageiros`}
                  />
                  <BenefitItem text="Cadastre quantos passageiros quiser" />

                  <BenefitItem text="Envio automático de Recibos aos pais/responsáveis" />
                  <BenefitItem text="Relatórios Financeiros" />
                </div>
              );
            })()}
          </div>

          {/* Botão Ver Mais Benefícios */}
          <button
            onClick={() => setIsBenefitsOpen(true)}
            className="w-full text-center text-xs font-semibold text-gray-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-1 py-2 mt-2"
          >
            Ver todos recursos
            <ChevronRight className="w-3 h-3" />
          </button>
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
