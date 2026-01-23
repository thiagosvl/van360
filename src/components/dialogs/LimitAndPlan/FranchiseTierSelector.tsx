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
    (a, b) => (a?.quantidade || 0) - (b?.quantidade || 0),
  );

  // Mapear ID selecionado para índice do slider
  const selectedIndex = sortedOptions.findIndex(
    (opt) => opt.id === selectedTierId,
  );

  // Safe index (fallback to 0)
  const [sliderValue, setSliderValue] = useState([
    selectedIndex !== -1 ? selectedIndex : 0,
  ]);

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
    const minVal = Number(minAllowedQuantity) || 0;
    const currentVal = Number(manualQuantity);
    const isInvalid = currentVal > 0 && currentVal < minVal;

    return (
      <div className="bg-white p-3 rounded-xl border-2 border-violet-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex-1 pb-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={cn(
                "w-full text-2xl font-bold placeholder:text-gray-300 focus:outline-none bg-transparent transition-colors",
                isInvalid ? "text-red-500" : "text-violet-900",
              )}
              placeholder="00"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(e.target.value)}
              autoFocus
            />
          </div>
          <span
            className={`text-[10px] font-bold block mt-1 ${
              isInvalid ? "text-red-500" : "text-gray-400"
            }`}
          >
            Mínimo personalizado: {minVal}
          </span>
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
  const currentQuantity = currentOption?.quantidade || 0;

  // Sincronizar input com slider
  const [inputValue, setInputValue] = useState(String(currentQuantity));

  useEffect(() => {
    setInputValue(String(currentQuantity));
  }, [currentQuantity]);

  // Handler para input manual
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 0) {
      // Encontrar tier mais próximo
      const nearestIndex = sortedOptions.reduce((closest, opt, idx) => {
        const currentDiff = Math.abs((opt.quantidade || 0) - numValue);
        const closestDiff = Math.abs((sortedOptions[closest].quantidade || 0) - numValue);
        return currentDiff < closestDiff ? idx : closest;
      }, 0);

      // Se o valor está exatamente em um tier, seleciona ele
      const exactMatch = sortedOptions.find(opt => opt.quantidade === numValue);
      if (exactMatch) {
        const exactIndex = sortedOptions.indexOf(exactMatch);
        setSliderValue([exactIndex]);
        if (exactMatch.id) {
          setSelectedTierId(exactMatch.id);
        }
      } else {
        // Se não está em um tier, move slider para o mais próximo
        setSliderValue([nearestIndex]);
      }
    }
  };

  // Handler para blur do input (quando usuário sai do campo)
  const handleInputBlur = () => {
    const numValue = Number(inputValue);
    
    // Se valor é válido mas não está em um tier, ativa modo custom
    if (!isNaN(numValue) && numValue >= minAllowedQuantity) {
      const exactMatch = sortedOptions.find(opt => opt.quantidade === numValue);
      if (!exactMatch) {
        setIsCustomQuantityMode(true);
        setManualQuantity(numValue);
      }
    } else if (numValue < minAllowedQuantity) {
      // Se menor que mínimo, reseta para o valor atual do slider
      setInputValue(String(currentQuantity));
    }
  };

  return (
    <div className="w-full px-2 py-4">
      {/* Visualização de Valor */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Selecionado
          </span>
          <span className="text-4xl font-black text-violet-600 tracking-tighter leading-none">
            {currentQuantity}{" "}
            <span className="text-lg font-bold text-gray-400">passageiros</span>
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="px-2 mb-6">
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
                i === sliderValue[0]
                  ? "text-violet-600 font-bold"
                  : "text-gray-300 hover:text-gray-400",
              )}
              onClick={() => handleSliderChange([i])}
            >
              <span className="text-xs">|</span>
              <span className="text-[10px] mt-1">{opt.quantidade}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500 font-semibold tracking-wider">
            ou
          </span>
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 block">
          Digite uma quantidade específica:
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={minAllowedQuantity}
            className={cn(
              "w-full px-4 py-3 text-lg font-bold rounded-xl border-2 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
              Number(inputValue) >= minAllowedQuantity
                ? "border-gray-200 text-gray-900"
                : "border-red-200 text-red-500"
            )}
            placeholder="Ex: 25"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
            passageiros
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Mínimo: <strong>{minAllowedQuantity}</strong> passageiros
          </span>
          {Number(inputValue) >= minAllowedQuantity && !sortedOptions.find(opt => opt.quantidade === Number(inputValue)) && (
            <span className="text-xs text-blue-600 font-semibold">
              • Quantidade personalizada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
