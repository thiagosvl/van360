import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Crown, Milestone, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  minAllowedQuantity: number;
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
  minAllowedQuantity,
}: FranchiseTierSelectorProps) {

  // Ordenar opções por quantidade
  const sortedOptions = [...availableOptions].sort(
    (a, b) => (a?.quantidade || 0) - (b?.quantidade || 0)
  );

  // Mapear ID selecionado para índice do slider
  const selectedIndex = sortedOptions.findIndex(
    (opt) => opt.id === selectedTierId
  );
  
  // Safe index (fallback to 0)
  const [sliderValue, setSliderValue] = useState([selectedIndex !== -1 ? selectedIndex : 0]);

  // Sincronizar slider se a seleção externa mudar
  useEffect(() => {
    if (selectedIndex !== -1) {
       setSliderValue([selectedIndex]);
    }
  }, [selectedIndex]);

  const handleSliderChange = (val: number[]) => {
    const newIndex = val[0];
    setSliderValue([newIndex]);
    const option = sortedOptions[newIndex];
    if (option && option.id) {
       setSelectedTierId(option.id);
    }
  };

  if (isCustomQuantityMode) {
    const isInvalid = Number(manualQuantity) < minAllowedQuantity;

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
              Mínimo: {minAllowedQuantity}
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
        onClick={() => {
            setIsCustomQuantityMode(true);
            if (currentTierOption?.quantidade) {
                 setManualQuantity(currentTierOption.quantidade);
            }
        }}
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
  
  const currentOption = sortedOptions[sliderValue[0]] || sortedOptions[0];

  return (
    <div className="w-full px-2 py-4">
       {/* Visualização de Valor */}
       <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Selecionado
                </span>
                <span className="text-4xl font-black text-violet-600 tracking-tighter leading-none">
                    {currentOption?.quantidade} <span className="text-lg font-bold text-gray-400">passageiros</span>
                </span>
            </div>
            
            <div 
                className="cursor-pointer group flex items-center gap-2 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-lg transition-colors"
                onClick={() => {
                   setIsCustomQuantityMode(true);
                   setManualQuantity("");
                }}
            >
                <div className="bg-white p-1 rounded-full shadow-sm text-violet-600 group-hover:scale-110 transition-transform">
                    <Milestone className="w-4 h-4" />
                </div>
                <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-violet-600 line-clamp-1">
                        Preciso de Mais
                    </span>
                 </div>
            </div>
       </div>

      {/* Slider */}
      <div className="px-2">
         <Slider
            value={sliderValue}
            min={0}
            max={sortedOptions.length - 1}
            step={1}
            onValueChange={handleSliderChange}
            className="cursor-grab active:cursor-grabbing py-4"
         />
         <div className="flex justify-between mt-2 px-1">
            {sortedOptions.map((opt, i) => (
                <div 
                    key={opt.id} 
                    className={cn(
                        "flex flex-col items-center cursor-pointer transition-colors", 
                        i === sliderValue[0] ? "text-violet-600 font-bold" : "text-gray-300 hover:text-gray-400"
                    )}
                    onClick={() => handleSliderChange([i])}
                >
                    <span className="text-xs">|</span>
                    <span className="text-[10px] mt-1">{opt.quantidade}</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
