import { Loader2 } from "lucide-react";
import { BenefitItem } from "./BenefitItem";
import { ExpansionSummary } from "./ExpansionSummary";
import { FranchiseTierSelector } from "./FranchiseTierSelector";

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
          {/* 1. SELETOR (Horizontal Scroll - Mobile First) */}
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {salesContext === "expansion"
                  ? "NOVA CAPACIDADE"
                  : "TAMANHO DA SUA FROTA"}
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
                  <BenefitItem
                    text={`Cobranças Automáticas para até ${currentTierOption?.quantidade} Passageiros`}
                    description="Nós cobramos os pais para você todo mês, sem estresse."
                  />
                  <BenefitItem 
                    text="Cadastros Ilimitados" 
                    description="Organize toda a sua frota no aplicativo."
                  />
                  <BenefitItem 
                    text="Envio automático de Recibos"
                    description="Seus clientes recebem comprovantes no WhatsApp."
                  />
                 <BenefitItem 
                    text="Relatórios Financeiros"
                    description="Saiba exatamente quanto cada van está lucrando."
                  />
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
