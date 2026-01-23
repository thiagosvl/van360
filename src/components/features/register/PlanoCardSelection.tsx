import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  PLANO_ESSENCIAL,
  PLANO_PROFISSIONAL,
  QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO,
} from "@/constants";
import { cn } from "@/lib/utils";
import { Plano, SubPlano } from "@/types/plano";
import { getMaiorSubplanoProfissional } from "@/utils/domain/plano/planoStructureUtils";
import { toast } from "@/utils/notifications/toast";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  valorPorCobranca = null,
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

  // Sub-planos do Profissional
  const subPlanosProfissional = isProfissional
    ? subPlanos.filter((s) => s.parent_id === plano.id)
    : [];

  // Ordenar sub-planos por franquia (menor para maior)
  const subPlanosOrdenados = [...subPlanosProfissional].sort(
    (a, b) => a.franquia_cobrancas_mes - b.franquia_cobrancas_mes
  );

  // Obter maior sub-plano para calcular mínimo do slider
  const maiorSubplano = isProfissional
    ? getMaiorSubplanoProfissional([plano], subPlanosProfissional)
    : null;
  const quantidadeMinimaSlider = maiorSubplano
    ? maiorSubplano.franquia_cobrancas_mes + 1
    : 0;

  // Sync prop to local state
  useEffect(() => {
    if (!isTyping) {
      setInputValue(quantidadePersonalizada);
    }
  }, [quantidadePersonalizada, isTyping]);

  // Handler (Commiter) for changes
  const handleQuantidadeChange = (value: string) => {
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

      // Limpar sub-plano quando o usuário começar a digitar quantidade personalizada
      if (selectedSubPlanoId && numericValue !== "") {
        onSubPlanoSelect?.(undefined);
      }

      onQuantidadePersonalizadaChange?.(numericValue);
    }
  };

  // Debounce Effect
  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      const numericValue = Number(inputValue);
      let finalValue = inputValue;

      // Auto-correct to minimum
      // Só corrige se tiver algo digitado, não estiver vazio (se vazio, assume 0 ou deixa limpar)
      // Mas o requisito diz "valor digitado inferior ao minimo", assumindo que user digitou algo válido
      if (inputValue !== "" && numericValue < quantidadeMinimaSlider) {
        finalValue = String(quantidadeMinimaSlider);
        setInputValue(finalValue);
      }

      handleQuantidadeChange(finalValue);
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, isTyping, quantidadeMinimaSlider, handleQuantidadeChange]); // TODO: handleQuantidadeChange must be stable or use ref but it depends on props. Warning?

  // Handler for Local Input
  const handleLocalInputChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length > 4) return;
    const numValue = Number(numericValue);
    if (numValue > QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO) return;

    setInputValue(numericValue);
    setIsTyping(true);

    if (!isSelected) {
      onSelect(plano.id);
    }
    if (selectedSubPlanoId && numericValue !== "") {
      onSubPlanoSelect?.(undefined);
    }
    if (!personalizadoClicado) {
      handlePersonalizadoSelect();
    }
  };

  // Determinar qual opção está selecionada (sub-plano ou personalizado)
  const opcaoSelecionada = selectedSubPlanoId
    ? selectedSubPlanoId
    : quantidadePersonalizada || personalizadoClicado
    ? "personalizado"
    : null;

  // Obter quantidade mínima
  const quantidadeMinima = getQuantidadeMinima?.() ?? null;
  // Usar quantidadeMinimaSlider se disponível (maior sub-plano + 1), senão usar quantidadeMinima
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

  // Handler para seleção de sub-plano via pill
  const handleSubPlanoSelect = (subPlanoId: string) => {
    onSelect(plano.id);

    setPersonalizadoClicado(false);
    setSliderExpandido(false);
    onSubPlanoSelect?.(subPlanoId);
    onQuantidadePersonalizadaChange?.("");
    setIsTyping(false); // Reset typing
    setInputValue(""); // Clear input
  };

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
  const handlePersonalizadoSelect = () => {
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
  };

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

      if (quantidadePersonalizada) {
        if (!isQuantidadeValida) return null;
        if (precoCalculadoPreview !== null) return precoCalculadoPreview;
        return null;
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

  // Preço original (sem promoção)
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

  // Função para substituir placeholders nos benefícios
  const processarBeneficio = (beneficio: string): string => {
    if (beneficio.includes("{{LIMITE_PASSAGEIROS}}")) {
      return beneficio.replace(
        "{{LIMITE_PASSAGEIROS}}",
        plano.limite_passageiros || "0"
      );
    }
    return beneficio;
  };

  // Estilos específicos para cada plano (Dabang Style - Radio Behavior)
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
                  (isProfissional &&
                    quantidadePersonalizada &&
                    isQuantidadeValida &&
                    !precoCalculadoPreview)) ? (
                  <Skeleton className="h-9 w-24 mx-1" />
                ) : (
                  <span className="text-3xl font-extrabold text-gray-900">
                    {precoExibido?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
                <span className="text-gray-500 ml-1 text-sm">/mês</span>
              </div>
            </div>
        </div>

        {/* Seletor de Quantidade (Apenas Profissional e Selecionado) */}
        {isProfissional && isSelected && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-5 space-y-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2"
          >
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
              Passageiros com cobrança
            </div>

            <div className="grid grid-cols-3 gap-2">
              {subPlanosOrdenados.map((subPlano) => {
                const isSubSelecionado = selectedSubPlanoId === subPlano.id;
                return (
                  <button
                    key={subPlano.id}
                    type="button"
                    onClick={() => handleSubPlanoSelect(subPlano.id)}
                    className={cn(
                      "px-1 py-2 rounded-lg text-sm font-medium transition-all border",
                      isSubSelecionado
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    )}
                  >
                    {subPlano.franquia_cobrancas_mes}
                  </button>
                );
              })}
            </div>

            {!sliderExpandido && subPlanosOrdenados.length > 0 && (
              <button
                type="button"
                onClick={handleExpandirSlider}
                className="text-xs text-blue-600 hover:text-blue-700 underline font-medium w-full text-center mt-1"
              >
                Preciso de mais passageiros
              </button>
            )}

            {sliderExpandido && (
              <div
                id={`custom-quantity-section-${plano.id}`}
                className="mt-2 pt-2 border-t border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Personalizado:
                  </span>
                  <span className="text-base font-bold text-blue-600">
                    {inputValue || "0"}
                  </span>
                </div>

                <Slider
                  value={[
                    inputValue ? parseInt(inputValue) : quantidadeMinimaSlider,
                  ]}
                  min={quantidadeMinimaSlider}
                  max={QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO}
                  step={10}
                  onValueChange={(value) => {
                    const newValue = String(value[0]);
                    handleQuantidadeChange(newValue);
                    if (!personalizadoClicado) {
                      handlePersonalizadoSelect();
                    }
                  }}
                  className="w-full mb-3"
                />

                <div className="flex items-center gap-2 pt-3">
                  <Input
                    id={`quantidade-personalizada-${plano.id}`}
                    type="number"
                    min={quantidadeMinimaSlider}
                    max={QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO}
                    value={inputValue}
                    onChange={(e) => {
                      handleLocalInputChange(e.target.value);
                    }}
                    onFocus={handleInputFocus}
                    className="h-8 text-sm text-center bg-gray-50"
                    placeholder="Qtd."
                  />
                </div>
              </div>
            )}
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
            disabled={isCalculandoPreco}
            className={cn(
              "w-full py-5 text-sm uppercase tracking-wide font-bold transition-all rounded-xl",
              getButtonStyles(),
              isCalculandoPreco && "opacity-70 cursor-wait"
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
