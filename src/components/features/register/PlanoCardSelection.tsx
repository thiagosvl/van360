import { PlanCapacitySelector } from "@/components/common/PlanCapacitySelector";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLANO_ESSENCIAL,
  PLANO_PROFISSIONAL,
  QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO,
} from "@/constants";
import { cn } from "@/lib/utils";
import { PlanSalesContext } from "@/types/enums";
import { Plano, SubPlano } from "@/types/plano";
import { getMaiorSubplanoProfissional } from "@/utils/domain/plano/planoStructureUtils";
import { toast } from "@/utils/notifications/toast";
import { Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PlanoCardSelectionProps {
  plano: Plano;
  subPlanos: SubPlano[];
  isSelected: boolean;
  onSelect: (planoId: string) => void;
  // Props para o plano Profissional
  selectedSubPlanoId?: string | null;
  quantidadePersonalizada?: string;
  onSubPlanoSelect?: (subPlanoId: string | undefined) => void;
  onQuantidadePersonalizadaChange?: (value: string) => void;
  precoCalculadoPreview?: number | null;
  valorPorCobranca?: number | null;
  isCalculandoPreco?: boolean;
  getQuantidadeMinima?: () => number | null;
  onQuantidadePersonalizadaConfirm?: () => void;
  onAvancarStep?: () => void;
  cardClassName?: string;
}

export const PlanoCardSelection = ({
  plano,
  subPlanos,
  isSelected,
  onSelect,
  selectedSubPlanoId,
  quantidadePersonalizada = "",
  onSubPlanoSelect,
  onQuantidadePersonalizadaChange,
  precoCalculadoPreview = null,
  isCalculandoPreco = false,
  getQuantidadeMinima,
  onQuantidadePersonalizadaConfirm,
  onAvancarStep,
  cardClassName,
}: PlanoCardSelectionProps) => {
  const isProfissional = plano.slug === PLANO_PROFISSIONAL;
  const isEssencial = plano.slug === PLANO_ESSENCIAL;

  // Estado local para controlar se o personalizado foi clicado e se o slider está expandido
  const [personalizadoClicado, setPersonalizadoClicado] = useState(false);
  const [sliderExpandido, setSliderExpandido] = useState(false);
  const [inputValue, setInputValue] = useState(quantidadePersonalizada);
  const [isTyping, setIsTyping] = useState(false);

  // Filters
  const subPlanosProfissional = useMemo(() => isProfissional
    ? subPlanos.filter((s) => s.parent_id === plano.id)
    : [], [isProfissional, subPlanos, plano.id]);

  // Sorters
  const subPlanosOrdenados = [...subPlanosProfissional].sort(
    (a, b) => a.franquia_cobrancas_mes - b.franquia_cobrancas_mes
  );

  const maiorSubplano = isProfissional
    ? getMaiorSubplanoProfissional([plano], subPlanosProfissional)
    : null;
  const quantidadeMinimaSlider = maiorSubplano
    ? maiorSubplano.franquia_cobrancas_mes + 1
    : 0;

  useEffect(() => {
    if (!isTyping) {
      // Prevent clearing input if we have a tier selected and the custom section is active
      // This allows the input to show the "snapped" value (e.g. 8) even if the prop is technically empty
      if (selectedSubPlanoId && personalizadoClicado && quantidadePersonalizada === "" && inputValue !== "") {
           return;
      }
      setInputValue(quantidadePersonalizada);
    }
  }, [quantidadePersonalizada, isTyping, selectedSubPlanoId, personalizadoClicado, inputValue, subPlanosProfissional]);

  // Handler (Commiter) for changes
  const handleQuantidadeChange = useMemo(() => (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length > 4) {
      return;
    }

    const numValue = numericValue === "" ? 0 : Number(numericValue);

    if (numValue > QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO) {
      return;
    }

    if (numericValue === "" || (!isNaN(numValue) && numValue >= 0)) {
      if (!isSelected) {
        onSelect(plano.id);
      }

      // REMOVED redundancy: Let PlanCapacitySelector debounce handle deselection
      // if (selectedSubPlanoId && numericValue !== "") {
      //   onSubPlanoSelect?.(undefined);
      // }

      const valToSend = numericValue === "" ? "0" : numericValue;
      onQuantidadePersonalizadaChange?.(valToSend);
    }
  }, [isSelected, onSelect, plano.id, selectedSubPlanoId, onSubPlanoSelect, onQuantidadePersonalizadaChange]);

  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      let finalValue = inputValue;

      handleQuantidadeChange(finalValue);
      
      // Only exit typing mode if value is present. 
      // If empty, we stay in typing mode to prevent Parent from reverting us to a default value (e.g. 9) logic loop.
      if (finalValue !== "") {
         setIsTyping(false);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [inputValue, isTyping, quantidadeMinimaSlider, handleQuantidadeChange]); // TODO: handleQuantidadeChange must be stable or use ref but it depends on props. Warning?

  // Handler para seleção de personalizado
  const handlePersonalizadoSelect = useCallback(() => {
    onSelect(plano.id);
    setPersonalizadoClicado(true);
    setSliderExpandido(false); // Inicialmente oculto

    if (selectedSubPlanoId) {
      onSubPlanoSelect?.(undefined);
    }

    setTimeout(() => {
      const input = document.getElementById(
        `quantidade-personalizada-${plano.id}`
      );
      input?.focus();
    }, 0);
  }, [onSelect, plano.id, selectedSubPlanoId, onSubPlanoSelect]);

  // Handler for Local Input
  const handleLocalInputChange = useCallback((value: string, immediate = false) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length > 4) return;
    const numValue = Number(numericValue);
    if (numValue > QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO) return;

    setInputValue(numericValue);
    const valToSend = numericValue === "" ? "0" : numericValue;
    onQuantidadePersonalizadaChange?.(valToSend); // Update prop immediately

    if (immediate) {
      setIsTyping(false);
      handleQuantidadeChange(numericValue);
    } else {
      setIsTyping(true);
    }

    if (!isSelected) {
      onSelect(plano.id);
    }
    if (!isSelected) {
      onSelect(plano.id);
    }
    // REMOVED: let debounce handle deselect
    // if (selectedSubPlanoId && numericValue !== "") {
    //   onSubPlanoSelect?.(undefined);
    // }
    if (!personalizadoClicado) {
      handlePersonalizadoSelect();
    }
  }, [isSelected, onSelect, plano.id, selectedSubPlanoId, onSubPlanoSelect, personalizadoClicado, handlePersonalizadoSelect, handleQuantidadeChange, onQuantidadePersonalizadaChange]);

  const opcaoSelecionada = selectedSubPlanoId
    ? selectedSubPlanoId
    : quantidadePersonalizada || personalizadoClicado
    ? "personalizado"
    : null;

  const quantidadeMinima = getQuantidadeMinima?.() ?? null;
  const quantidadeMinimaParaValidacao =
    isProfissional && quantidadeMinimaSlider > 0
      ? quantidadeMinimaSlider
      : quantidadeMinima;

  // Verificar se a quantidade personalizada é válida
  const quantidadeDigitada = quantidadePersonalizada
    ? Number(quantidadePersonalizada)
    : 0;
  const isQuantidadeValida =
    quantidadePersonalizada &&
    quantidadeMinimaParaValidacao !== null &&
    quantidadeDigitada > 0 &&
    quantidadeDigitada >= quantidadeMinimaParaValidacao;

  // Re-entrancy lock to prevent feedback loops during sync
  const isSyncingRef = useRef(false);

  // Handler para seleção de sub-plano via pill
  const handleSubPlanoSelect = useCallback((subPlanoId: string, source?: 'click' | 'snap') => {
    // If it's a snap event (validation), check lock and block re-entrancy
    if (source === 'snap') {
       if (isSyncingRef.current) return;
    }

    if (!isSelected) {
       onSelect(plano.id);
    }

    setPersonalizadoClicado(true);
    // setSliderExpandido(false); // REMOVED: Keep expanded
    onSubPlanoSelect?.(subPlanoId);
    
    // If source is 'snap', we preserve the input as is and do NOT sync/clear
    if (source === 'snap') return;

    // Stop typing mode immediately to prevent race conditions with pending debounces
    setIsTyping(false);
    
    // Sync local input visually to match the tier (Only for Clicks)
    if (onQuantidadePersonalizadaChange) {
       // Find the quantity of the selected subplan
       const sp = subPlanosProfissional.find(s => s.id === subPlanoId);
       if (sp) {
          isSyncingRef.current = true;
          setInputValue(String(sp.franquia_cobrancas_mes));
          // Release lock after render
          setTimeout(() => { isSyncingRef.current = false; }, 0);
       }
    } else {
        onQuantidadePersonalizadaChange?.("");
        setInputValue("");
    }
  }, [onSelect, plano.id, onSubPlanoSelect, onQuantidadePersonalizadaChange, subPlanosProfissional, isSelected]);

  // Memoize the callback passed to PlanCapacitySelector to prevent re-render loops
  const handleCapacitySelectorSelect = useCallback((id: string | number | undefined, source?: 'click' | 'snap') => {
       if (id) {
          handleSubPlanoSelect(String(id), source);
       } else {
          // Se id for undefined/null, significa que limpou a seleção (ex: entrou em custom)
          if (selectedSubPlanoId) {
             onSubPlanoSelect?.(undefined);
          }
       }
  }, [handleSubPlanoSelect, onSubPlanoSelect]);

  // NOTE: removed original handleQuantidadeChange definition from here since I moved it up

  // Resetar estado do slider quando selecionar outro plano ou limpar seleção
  useEffect(() => {
    if (!isSelected && sliderExpandido) {
      setSliderExpandido(false);
      setPersonalizadoClicado(false);
    }
  }, [isSelected, sliderExpandido]);

  // Auto-expandir slider se já vier com quantidade personalizada (ex: persistência ou URL)
  useEffect(() => {
    if (
      isSelected &&
      isProfissional &&
      quantidadePersonalizada &&
      !sliderExpandido
    ) {
      setSliderExpandido(true);
      setPersonalizadoClicado(true);
    }
  }, [isSelected, isProfissional, quantidadePersonalizada, sliderExpandido]);

  // Handler para seleção de personalizado


  // Handler para expandir slider
  const handleExpandirSlider = () => {
    onSelect(plano.id); // Garantir que o card está selecionado
    setSliderExpandido(true);
    setPersonalizadoClicado(true);
    // Limpar seleção do sub-plano PRIMEIRO, antes de definir a quantidade
    if (selectedSubPlanoId) {
      onSubPlanoSelect?.(undefined);
    }
    setTimeout(() => {
      // Definir valor inicial como o mínimo do slider (maior sub-plano + 1)
      if (quantidadeMinimaSlider > 0 && !quantidadePersonalizada) {
        onQuantidadePersonalizadaChange?.(String(quantidadeMinimaSlider));
        setInputValue(String(quantidadeMinimaSlider)); // Update local too
      }
      // Scroll suave para baixo após expandir o slider
      setTimeout(() => {
        const customSection = document.getElementById(
          `custom-quantity-section-${plano.id}`
        );
        if (customSection) {
          customSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 200);
    }, 0);
  };

  // Handler para clique no input personalizado
  const handleInputFocus = () => {
    if (!isSelected) {
      onSelect(plano.id);
    }
    if (!personalizadoClicado) {
      handlePersonalizadoSelect();
    }
  };

  // Calcular preço dinâmico baseado na seleção
  const precoExibido = useMemo(() => {
    if (isProfissional) {
      // Se não estiver selecionado, mostrar sempre o menor preço ("A partir de")
      if (!isSelected) {
        return Math.min(
          ...(subPlanosProfissional.map((s) =>
            Number(s.promocao_ativa ? s.preco_promocional : s.preco)
          ) || [0])
        );
      }

      if (selectedSubPlanoId) {
        const subPlano = subPlanosProfissional.find(
          (s) => s.id === selectedSubPlanoId
        );
        if (subPlano) {
          return subPlano.promocao_ativa && subPlano.preco_promocional
            ? subPlano.preco_promocional
            : subPlano.preco;
        }
      }

      if (quantidadePersonalizada) {
        if (!isQuantidadeValida) return null;
        if (precoCalculadoPreview !== null) return precoCalculadoPreview;
        return null;
      }
      // If we are selected but NO subplan (and not custom matching), it means we are in the "Empty Input" state
      // (e.g. user selected custom then cleared it). Should show "R$ --" or similar to indicate pending input.
      if (isSelected && !selectedSubPlanoId && quantidadePersonalizada === "") {
        return null;
      }

      return Math.min(
        ...(subPlanosProfissional.map((s) =>
          Number(s.promocao_ativa ? s.preco_promocional : s.preco)
        ) || [0])
      );
    }

    return plano.promocao_ativa && plano.preco_promocional
      ? plano.preco_promocional
      : plano.preco;
  }, [
    isProfissional,
    isSelected,
    selectedSubPlanoId,
    subPlanosProfissional,
    precoCalculadoPreview,
    quantidadePersonalizada,
    isQuantidadeValida,
    plano,
  ]);

  const precoOriginal = useMemo(() => {
    if (isProfissional) {
      if (selectedSubPlanoId) {
        const subPlano = subPlanosProfissional.find(
          (s) => s.id === selectedSubPlanoId
        );
        if (subPlano) return subPlano.preco;
      }
      // Se não tiver sub-plano selecionado (ou customizado), pega o menor preço base
      return Math.min(...(subPlanosProfissional.map((s) => Number(s.preco)) || [0]));
    }
    return plano.preco;
  }, [isProfissional, selectedSubPlanoId, subPlanosProfissional, plano.preco]);

  const processarBeneficio = (beneficio: string): string => {
    if (beneficio.includes("{{LIMITE_PASSAGEIROS}}")) {
      return beneficio.replace(
        "{{LIMITE_PASSAGEIROS}}",
        plano.limite_passageiros || "0"
      );
    }
    return beneficio;
  };

  const getCardStyles = () => {
    const baseStyles = "cursor-pointer transition-all duration-300 relative";

    if (isSelected) {
      if (isProfissional) {
        return cn(
          baseStyles,
          "border-2 border-yellow-400 bg-yellow-50/30 shadow-lg ring-1 ring-yellow-400/50 z-10"
        );
      }
      return cn(
        baseStyles,
        "border-2 border-blue-600 bg-blue-50/30 shadow-md ring-1 ring-blue-600/20 z-10"
      );
    }

    if (isProfissional) {
      return cn(
        baseStyles,
        "border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-md"
      );
    }

    return cn(
      baseStyles,
      "border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
    );
  };

  const getButtonStyles = () => {
    if (isProfissional) {
      return "bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold shadow-sm hover:shadow-md transform active:scale-95 transition-all";
    }
    if (isEssencial) {
      return "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold";
    }
    return "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium";
  };

  const getButtonText = () => {
    if (isSelected) return "Escolher Plano";
    if (isEssencial) return "Selecionar Essencial";
    if (isProfissional) return "Selecionar Profissional";
    return "Selecionar";
  };

  // Memoize options to prevent infinite loops in PlanCapacitySelector useEffect
  const capacityOptions = useMemo(() => subPlanosProfissional.map(sp => ({
    id: sp.id,
    quantity: sp.franquia_cobrancas_mes,
    label: sp.nome,
    isCustom: false
  })), [subPlanosProfissional]);

  return (
    <div
      onClick={() => !isCalculandoPreco && onSelect(plano.id)}
      className={cn(
        "relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300",
        getCardStyles(),
        cardClassName
      )}
    >
      {/* Indicador de Seleção (Radio Check) */}
      <div
        className={cn(
          "absolute right-4 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all z-20",
          isProfissional ? "top-12" : "top-4",
          isSelected
            ? isProfissional
              ? "bg-yellow-400 border-yellow-400"
              : "bg-blue-600 border-blue-600"
            : "border-gray-300 bg-white"
        )}
      >
        {isSelected && (
          <Check
            className={cn(
              "h-3.5 w-3.5",
              isProfissional ? "text-gray-900" : "text-white"
            )}
            strokeWidth={3}
          />
        )}
      </div>

      {/* Badge Recomendado para Profissional */}
      {isProfissional && (
        <div className="bg-yellow-400 text-gray-900 text-[10px] font-bold text-center py-1 uppercase tracking-widest">
          Mais Escolhido
        </div>
      )}

      <CardContent className="p-5 sm:p-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="mb-3 pr-8">
          <h3
            className={cn(
              "text-lg font-bold",
              isSelected ? "text-gray-900" : "text-gray-700"
            )}
          >
            {plano.nome}
          </h3>
          <p className="text-xs text-gray-500 mt-1 min-h-[32px] leading-relaxed">
            {plano.descricao_curta}
          </p>
        </div>

        {/* Preço */}
        <div className="mb-5">
            <div>
              {plano.promocao_ativa && (plano.slug === PLANO_PROFISSIONAL || plano.preco_promocional) && !quantidadePersonalizada && (
                <div className="text-xs text-gray-400 line-through mt-0.5">
                  R${" "}
                  {precoOriginal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}
              <div className="flex items-baseline">
                <span className="text-xs text-gray-500 mr-1">R$</span>
                {/* Loader aparece se estiver calculando OU se for personalizado e não tiver preço ainda */}
                {isSelected &&
                (isCalculandoPreco || 
                  (isTyping && quantidadePersonalizada !== "0" && quantidadePersonalizada !== "") ||
                  (isProfissional &&
                    quantidadePersonalizada && quantidadePersonalizada !== "0" &&
                    isQuantidadeValida &&
                    !precoCalculadoPreview)) ? (
                  <Skeleton className="h-9 w-24 mx-1" />
                ) : (
                  <span className="text-3xl font-extrabold text-gray-900">
                    {precoExibido !== null ? precoExibido.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) : "--"}
                  </span>
                )}
                <span className="text-gray-500 ml-1 text-sm">/mês</span>
              </div>
            </div>
        </div>

        {/* Seletor de Quantidade (Apenas Profissional e Selecionado) - Refatorado para usar componente compartilhado */}
        {isProfissional && isSelected && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-5 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2"
          >
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
               Quantidade de passageiros
             </div>
             
             <PlanCapacitySelector
                options={subPlanosOrdenados.map(s => ({
                  id: s.id,
                  quantity: s.franquia_cobrancas_mes,
                  isCustom: false
                }))}
                selectedOptionId={selectedSubPlanoId ?? null}
                onSelectOption={(id, source) => {
                   if (id) {
                      handleSubPlanoSelect(String(id), source);
                   } else {
                      // Se id for undefined/null, significa que limpou a seleção (ex: entrou em custom)
                      onSubPlanoSelect?.(undefined);
                   }
                }}
                customQuantity={inputValue}
                onCustomQuantityChange={handleLocalInputChange}
                minCustomQuantity={quantidadeMinimaSlider}
                maxCustomQuantity={QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO}
                salesContext={PlanSalesContext.REGISTER}
             />
          </div>
        )}

        {/* Features - Compactas no Mobile, Completas no Desktop */}
        <div className="flex-grow space-y-2 mb-5">
          {/* Desktop: Mostra todos */}
          <div className="hidden md:block space-y-2">
            {plano.beneficios.map((beneficio, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <Check
                  className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0"
                  strokeWidth={3}
                />
                <span className="text-xs text-gray-600 leading-snug">
                  {processarBeneficio(beneficio)}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile: Mantém comportamento de toggle */}
          <div className="md:hidden space-y-2">
            {plano.beneficios
              .slice(0, isSelected ? 5 : 3)
              .map((beneficio, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <Check
                    className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0"
                    strokeWidth={3}
                  />
                  <span className="text-xs text-gray-600 leading-snug">
                    {processarBeneficio(beneficio)}
                  </span>
                </div>
              ))}
            {!isSelected && plano.beneficios.length > 3 && (
              <div className="text-xs text-gray-400 pl-6">
                + {plano.beneficios.length - 3} benefícios
              </div>
            )}
          </div>
        </div>

        {/* Action Button - Só aparece se selecionado ou no mobile */}
        <div
          className={cn(
            "mt-auto transition-all duration-300",
            isSelected ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
          )}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (isProfissional) {
                if (!opcaoSelecionada) {
                  toast.error("Selecione a quantidade de passageiros");
                  return;
                }
                if (opcaoSelecionada === "personalizado") {
                  if (!quantidadePersonalizada) {
                    toast.error("Informe a quantidade");
                    return;
                  }
                  if (quantidadeMinima && !isQuantidadeValida) {
                    toast.error(`Mínimo de ${quantidadeMinima} passageiros`);
                    return;
                  }
                  onQuantidadePersonalizadaConfirm?.();
                }
              }
              onSelect(plano.id);
              onAvancarStep?.();
            }}
            disabled={isCalculandoPreco || (isProfissional && opcaoSelecionada === "personalizado" && !isQuantidadeValida)}
            className={cn(
              "w-full py-5 text-sm uppercase tracking-wide font-bold transition-all rounded-xl",
              getButtonStyles(),
              (isCalculandoPreco || (isProfissional && opcaoSelecionada === "personalizado" && !isQuantidadeValida)) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isCalculandoPreco ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getButtonText()
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
};
