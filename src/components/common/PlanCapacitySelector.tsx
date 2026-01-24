import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { PlanSalesContext } from "@/types/enums";
import { Crown, X } from "lucide-react";
import { useEffect, useState } from "react";

export interface PlanCapacityOption {
  id: string | number;
  label?: string;
  quantity: number;
  isCustom?: boolean;
}

interface PlanCapacitySelectorProps {
  options: PlanCapacityOption[];
  selectedOptionId: string | number | null;
  onSelectOption: (id: string | number | undefined, source?: 'click' | 'snap') => void;
  
  customQuantity: string | number;
  onCustomQuantityChange: (val: string, immediate?: boolean) => void;
  
  minCustomQuantity: number;
  maxCustomQuantity: number;
  
  salesContext?: PlanSalesContext;
}

export function PlanCapacitySelector({
  options,
  selectedOptionId,
  onSelectOption,
  customQuantity,
  onCustomQuantityChange,
  minCustomQuantity,
  maxCustomQuantity,
  salesContext = PlanSalesContext.UPGRADE,
}: PlanCapacitySelectorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const sortedOptions = [...options].sort((a, b) => a.quantity - b.quantity);

  const isCustomSelected = !selectedOptionId && !!customQuantity;
  
  useEffect(() => {
    if (customQuantity && !selectedOptionId && !isCustomMode) {
      setIsCustomMode(true);
    }
  }, [customQuantity, selectedOptionId, isCustomMode]);

  useEffect(() => {
    if (!isCustomMode) return;
    
    const timer = setTimeout(() => {
       // Check for empty input OR ZERO (after debounce) -> Deselect
       if (!customQuantity || String(customQuantity).trim() === "" || Number(customQuantity) === 0) {
          if (selectedOptionId) {
             onSelectOption(undefined);
          }
          return;
       }

       const val = Number(customQuantity);
       
       // Snap Logic: If value is within tier range, snap to nearest tier
       if (sortedOptions.length > 0) {
          const maxTierQuantity = sortedOptions[sortedOptions.length - 1].quantity;
          
          if (val <= maxTierQuantity) {
             const candidate = sortedOptions.find(o => o.quantity >= val);
             if (candidate) {
                // If already selected, do not snap again (prevents loop)
                if (candidate.id === selectedOptionId) {
                   if (val === candidate.quantity && isCustomMode) {
                      setIsCustomMode(false);
                   }
                   return;
                }

                onSelectOption(candidate.id, 'snap');
                
                if (val === candidate.quantity) {
                   setIsCustomMode(false);
                }
                return;
             }
          } else {
             // If value is greater than max tier, DESELECT any active tier
             // This ensures we are in pure custom mode
             if (selectedOptionId) {
                onSelectOption(undefined);
             }
          }
       }
       
       // Only validate if user typed something positive and NO snap happened (custom high value)
       // Actually, invalid values > maxTier are handled by parent validation/button disable usually.
       // User requested NO toast warning.
    }, 800); // 800ms debounce
    
    return () => clearTimeout(timer);
  }, [customQuantity, isCustomMode, minCustomQuantity, sortedOptions, onSelectOption, onCustomQuantityChange]);

  const handleExpandCustom = () => {
    setIsCustomMode(true);
    onSelectOption(undefined); // Clear tier selection
    
    // Always set custom value to min when expanding
    onCustomQuantityChange(String(minCustomQuantity), true);
    
    // Scroll to custom section
    setTimeout(() => {
        const el = document.getElementById("custom-quantity-section");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleOptionClick = (id: string | number) => {
    onSelectOption(id, 'click');
    
    // User requested to CLOSE the custom section when selecting a tier
    setIsCustomMode(false);
  };

  const handleCancelCustom = () => {
    setIsCustomMode(false);
    onCustomQuantityChange("", true);
    // Select first option if available as fallback?
    if (sortedOptions.length > 0) {
        onSelectOption(sortedOptions[0].id);
    }
  };

  // Special case: Single Custom Option (Legacy/Migration)
  if (options.length === 1 && options[0].isCustom) {
      const opt = options[0];
      return (
        <div
          className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-center justify-between shadow-sm group cursor-pointer hover:border-violet-300 transition-all"
          onClick={() => {
            setIsCustomMode(true);
            onCustomQuantityChange(String(opt.quantity));
          }}
        >
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-violet-600 fill-current" />
            <div className="text-left">
              <span className="block text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                {salesContext === PlanSalesContext.EXPANSION ? "Nova Capacidade" : "Sua Frota Atual"}
              </span>
              <span className="text-xl font-bold text-violet-900 leading-none">
                {opt.quantity} Passageiros
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
    <div className="space-y-4">
      {/* Grid of Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {sortedOptions.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleOptionClick(opt.id)}
              className={cn(
                "px-1 py-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center justify-center gap-1",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              <span className="font-bold text-lg leading-none">{opt.quantity}</span>
              <span className={cn("text-[10px] uppercase", isSelected ? "text-blue-100" : "text-gray-400")}>
                passageiros
              </span>
            </button>
          );
        })}
      </div>

      {/* "Preciso de mais" Link */}
      {!isCustomMode && sortedOptions.length > 0 && (
        <button
          type="button"
          onClick={handleExpandCustom}
          className="text-xs text-blue-600 hover:text-blue-700 underline font-medium w-full text-center py-2"
        >
          Tenho mais passageiros
        </button>
      )}

      {/* Custom Section */}
      {isCustomMode && (
        <div id="custom-quantity-section" className="pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
           <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Quantidade Personalizada
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancelCustom}
                className="h-6 w-6 p-0 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </Button>
           </div>

           <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
             <div className="flex items-end gap-3 mb-4">
                 <div className="flex-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Passageiros
                     </label>
                     <Input
                        type="number"
                        min={minCustomQuantity}
                        max={maxCustomQuantity}
                        value={customQuantity}
                        onChange={(e) => onCustomQuantityChange(e.target.value)}
                        className="h-10 text-lg font-bold bg-white border-gray-200 focus:border-blue-500"
                        autoFocus
                     />
                 </div>
             </div>

             <Slider
                value={[Number(customQuantity) || minCustomQuantity]}
                min={minCustomQuantity}
                max={maxCustomQuantity}
                step={10} // Step 10 for custom range as seen in Register.tsx
                onValueChange={(val) => onCustomQuantityChange(String(val[0]))}
                className="w-full"
             />
             <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
                <span>{minCustomQuantity}</span>
                <span>{maxCustomQuantity}</span>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
