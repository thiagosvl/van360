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
  manualQuantity: number;
  setManualQuantity: (v: number) => void;
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
  
  if (isCustomQuantityMode) {
    return (
      <div className="bg-white p-3 rounded-xl border-2 border-violet-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex-1 pb-1">
          <label className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block mb-1">
            Quantidade Personalizada
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-full text-2xl font-bold text-violet-900 placeholder:text-gray-300 focus:outline-none bg-transparent"
              placeholder="00"
              value={manualQuantity || ""}
              onChange={(e) => setManualQuantity(Number(e.target.value))}
              autoFocus
            />
            <span className="text-sm font-medium text-gray-400">Vagas</span>
          </div>
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
    <div className="bg-gray-100 p-1.5 rounded-xl flex flex-wrap justify-center gap-1.5 ring-1 ring-inset ring-black/5">
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
                "flex-1 min-w-[60px] py-1.5 rounded-lg text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center leading-none gap-0.5",
                isSelected
                  ? "bg-white text-violet-700 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50",
                isRecommended &&
                  !isSelected &&
                  "bg-violet-50/50 text-violet-600"
              )}
            >
              <span className="text-sm">{opt?.quantidade}</span>
              {isRecommended && (
                <span className="text-[8px] font-extrabold uppercase tracking-wideropacity-90">
                  {salesContext === "upgrade_auto" ? "Toda Frota" : "Ideal"}
                </span>
              )}
            </button>
          );
        })}

      {/* Botão Outro */}
      <button
        onClick={() => {
          setIsCustomQuantityMode(true);
          setManualQuantity(currentTierOption?.quantidade || 0);
        }}
        className="px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 flex items-center gap-1 min-w-[60px] justify-center"
      >
        Outro...
      </button>
    </div>
  );
}
