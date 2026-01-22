
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export const FRANCHISE_TIERS = [
  { quantidade: 25, preco: 107, id: "tier_25" },
  { quantidade: 50, preco: 147, id: "tier_50" },
  { quantidade: 90, preco: 227, id: "tier_90" }
];

export const PRECO_BASE_90 = 227;
export const PRECO_POR_EXCEDENTE = 2.50;

export function calculateFranchisePrice(quantidade: number): number {
    if (quantidade <= 90) {
        // Encontrar exato ou mais próximo?
        // User logic: "find(t => t.quantidade >= quantidade).preco"
        const tier = FRANCHISE_TIERS.find(t => t.quantidade === quantidade) 
                  || FRANCHISE_TIERS.find(t => t.quantidade >= quantidade)
                  || FRANCHISE_TIERS[FRANCHISE_TIERS.length - 1]; // Fallback to max
        return tier.preco;
    }
    const excedente = quantidade - 90;
    return PRECO_BASE_90 + (excedente * PRECO_POR_EXCEDENTE);
}

interface FranchiseSelectionProps {
  currentPassengerCount: number;
  selectedQuantity: number;
  onQuantityChange: (quantity: number, isCustom: boolean) => void;
  availableOptions?: any[]; // To map real IDs if needed
}

export function FranchiseSelection({
  currentPassengerCount,
  selectedQuantity,
  onQuantityChange,
  availableOptions = []
}: FranchiseSelectionProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [sliderValue, setSliderValue] = useState([0]); // Index 0-2
  const [customValue, setCustomValue] = useState(91);

  // Initialize state based on props (recommendation logic)
  useEffect(() => {
    if (selectedQuantity > 90) {
      setIsCustomMode(true);
      setCustomValue(selectedQuantity);
    } else {
      setIsCustomMode(false);
      const index = FRANCHISE_TIERS.findIndex(t => t.quantidade === selectedQuantity);
      if (index !== -1) {
        setSliderValue([index]);
      } else {
         // Fallback recommendation logic
         const recIndex = FRANCHISE_TIERS.findIndex(t => t.quantidade >= currentPassengerCount);
         const targetIndex = recIndex === -1 ? FRANCHISE_TIERS.length - 1 : recIndex;
         setSliderValue([targetIndex]);
         // Updates parent immediately? Maybe avoid loop
      }
    }
  }, []); // Run once or when props change significantly? If parent drives state, we should sync. 
  // But parent state `selectedQuantity` might be 0 initially.
  
  // Sync internal state when external selectedQuantity changes (if controlled)
  useEffect(() => {
     if (selectedQuantity > 90) {
        if (!isCustomMode) setIsCustomMode(true);
        if (customValue !== selectedQuantity) setCustomValue(selectedQuantity);
     } else {
        const index = FRANCHISE_TIERS.findIndex(t => t.quantidade === selectedQuantity);
        if (index !== -1 && sliderValue[0] !== index) {
            setSliderValue([index]);
            if (isCustomMode) setIsCustomMode(false);
        }
     }
  }, [selectedQuantity]);


  const handleSliderChange = (val: number[]) => {
    setSliderValue(val);
    const tier = FRANCHISE_TIERS[val[0]];
    onQuantityChange(tier.quantidade, false);
  };

  const currentTier = FRANCHISE_TIERS[sliderValue[0]];
  
  // Calcular Preço
  const quantityToCalc = isCustomMode ? customValue : currentTier.quantidade;
  const currentPrice = calculateFranchisePrice(quantityToCalc);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6">
      
      {/* Header com Preço Dinâmico */}
      <div className="flex flex-col items-center justify-center text-center space-y-1">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Investimento Mensal
        </span>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-extrabold text-blue-600">
            R$ {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-gray-500 font-medium self-end mb-1.5">/mês</span>
        </div>
      </div>

      {/* Área de Seleção */}
      <div className="pt-2 pb-4 px-2">
        {!isCustomMode ? (
          <div className="space-y-10">
            {/* Display Visual do Slider */}
            <div className="relative h-12 flex items-center justify-center">
                 {/* Recomendação Badge */}
                 {currentTier.quantidade >= currentPassengerCount && currentPassengerCount > 0 && (
                     <div className="absolute -top-10 left-1/2 -translate-left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                         <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1.5 py-1 px-3 shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                            Recomendado para você
                         </Badge>
                     </div>
                 )}

                 {/* Quantidade em Destaque */}
                 <div className="text-center space-y-1">
                    <p className="text-3xl font-bold text-gray-900">
                        {currentTier.quantidade}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                        Passageiros
                    </p>
                 </div>
            </div>

            {/* Slider Component */}
            <div className="px-2">
                <Slider
                    min={0}
                    max={2}
                    step={1}
                    value={sliderValue}
                    onValueChange={handleSliderChange}
                    className="cursor-pointer"
                />
                
                {/* Labels dos Tiers */}
                <div className="flex justify-between mt-3 text-xs font-medium text-gray-400 select-none">
                    {FRANCHISE_TIERS.map((tier, idx) => (
                        <div 
                            key={idx} 
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                sliderValue[0] === idx ? "text-blue-600 font-bold" : ""
                            )}
                            onClick={() => handleSliderChange([idx])}
                        >
                            <span>{tier.quantidade}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botão Personalizar */}
            <div className="flex justify-center pt-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                    onClick={() => {
                        setIsCustomMode(true);
                        setCustomValue(91);
                        onQuantityChange(91, true);
                    }}
                >
                    Preciso de mais de 90 passageiros
                </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
             {/* Input Mode */}
             <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-gray-200"
                        onClick={() => {
                            const val = Math.max(91, customValue - 1);
                            setCustomValue(val);
                            onQuantityChange(val, true);
                        }}
                    >
                        <Minus className="w-5 h-5 text-gray-600" />
                    </Button>
                    
                    <div className="relative">
                        <Input 
                            type="number" 
                            min={91}
                            value={customValue}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setCustomValue(val);
                                onQuantityChange(val, true);
                            }}
                            className="h-16 w-32 text-center text-3xl font-bold border-gray-200 focus:ring-blue-100 focus:border-blue-400 rounded-xl"
                        />
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                            Passageiros
                        </span>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-gray-200"
                        onClick={() => {
                            const val = customValue + 1;
                            setCustomValue(val);
                            onQuantityChange(val, true);
                        }}
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-500 max-w-[280px] mx-auto">
                    Para grandes frotas, cobramos R$ 2,50 por cada passageiro adicional acima de 90.
                </p>
             </div>

             <div className="flex justify-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-gray-900 gap-2"
                    onClick={() => {
                        setIsCustomMode(false);
                        handleSliderChange([2]); // Volta para o tier 90
                    }}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar para pacotes padrão
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
