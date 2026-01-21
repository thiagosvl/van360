import { cn } from "@/lib/utils";
import { Crown, X } from "lucide-react";

interface FranchiseOption {
  id?: string | number;
  quantidade?: number;
  isCustom?: boolean;
}

interface FranchiseTierSelectorProps {
  availableOptions: FranchiseOption[];
  salesContext: string;
  isCustomQuantityMode: boolean;
  setIsCustomQuantityMode: (v: boolean) => void;
  manualQuantity: number | string;
  setManualQuantity: (v: number | string) => void;
  selectedTierId: string | number | null;
  setSelectedTierId: (id: string | number | null) => void;
  currentTierOption: FranchiseOption | null;
}

export function FranchiseTierSelector({
  availableOptions,
  salesContext,
  isCustomQuantityMode,
  setIsCustomQuantityMode,
  manualQuantity,
  setManualQuantity,
  selectedTierId,
  setSelectedTierId,
  currentTierOption,
}: FranchiseTierSelectorProps) {
  
  // Calcular o máximo das opções padrão para validação
  const maxStandardQuantity = Math.max(
    ...availableOptions.map((o) => o.quantidade || 0),
    0
  );

  if (isCustomQuantityMode) {
    const isInvalid = Number(manualQuantity) <= maxStandardQuantity;

    return (
      <div className="bg-white p-3 rounded-xl border-2 border-violet-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex-1 pb-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={cn(
                "w-full text-2xl font-bold placeholder:text-gray-300 focus:outline-none bg-transparent transition-colors",
                isInvalid ? "text-red-500" : "text-violet-900"
              )}
              placeholder="00"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(e.target.value)}
              autoFocus
            />
          </div>
          {isInvalid && (
            <span className="text-[10px] text-red-500 font-bold block mt-1 animate-in slide-in-from-top-1">
              Mínimo: {maxStandardQuantity + 1}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCustomQuantityMode(false)}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          title="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Caso especial: Apenas 1 opção e é custom (upgrade de legado/migração)
  if (availableOptions.length === 1 && availableOptions[0].isCustom) {
    return (
      <div
        className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-center justify-between shadow-sm group cursor-pointer hover:border-violet-300 transition-all"
        onClick={() => setIsCustomQuantityMode(true)}
      >
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-violet-600 fill-current" />
          <div className="text-left">
            <span className="block text-[10px] font-bold text-violet-600 uppercase tracking-wider">
              {salesContext === "expansion"
                ? "Nova Capacidade"
                : "Sua Frota Atual"}
            </span>
            <span className="text-xl font-bold text-violet-900 leading-none">
              {currentTierOption?.quantidade} Passageiros
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-violet-400 bg-white/50 px-2 py-1 rounded-lg border border-violet-100 group-hover:bg-white group-hover:text-violet-600 transition-colors">
          Alterar
        </span>
      </div>
    );
  }

  return (
    <div className="relative -mx-6 px-6 overflow-x-auto pb-4 pt-6 scrollbar-hide snap-x snap-mandatory flex items-center gap-3">
      {availableOptions
        .sort((a, b) => (a?.quantidade || 0) - (b?.quantidade || 0))
        .map((opt, index) => {
          const isSelected = opt?.id === currentTierOption?.id;
          const isRecommended = index === 0 && salesContext !== "expansion";

          return (
            <button
              key={opt?.id}
              onClick={() => {
                if (opt?.id) setSelectedTierId(opt.id);
              }}
              className={cn(
                "relative min-w-[100px] h-[110px] rounded-2xl border-2 transition-all duration-300 snap-center flex flex-col items-center justify-center gap-1 group",
                isSelected
                  ? "bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-200 scale-105 z-10"
                  : "bg-white border-gray-100 text-gray-400 hover:border-violet-100 hover:bg-violet-50"
              )}
            >
              {isRecommended && (
                <span className={cn(
                  "absolute -top-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm",
                  isSelected 
                    ? "bg-white text-violet-600 border-violet-100" 
                    : "bg-emerald-100 text-emerald-700 border-emerald-100"
                )}>
                  Ideal
                </span>
              )}

              <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", isSelected ? "text-violet-200" : "text-gray-400")}>
                {isSelected ? "Selecionado" : "Opção"}
              </span>

              <span className={cn("text-4xl font-black tracking-tighter leading-none", isSelected ? "text-white" : "text-gray-900")}>
                {opt?.quantidade}
              </span>
              
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", isSelected ? "text-violet-100" : "text-gray-400")}>
                Vagas
              </span>
            </button>
          );
        })}

      {/* Botão Outro */}
      <button
        onClick={() => {
          setIsCustomQuantityMode(true);
          setManualQuantity("");
        }}
        className="min-w-[80px] h-[110px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-300 hover:text-violet-600 transition-all duration-300 snap-center flex flex-col items-center justify-center gap-2 group"
      >
        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
             <span className="text-xl leading-none mb-1">+</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">MAIS</span>
      </button>
      
      {/* Spacer for right padding in scroll */}
      <div className="w-2 shrink-0" />
    </div>
  );
}
