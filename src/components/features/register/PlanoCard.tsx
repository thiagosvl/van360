import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
    PLANO_COMPLETO,
    PLANO_ESSENCIAL,
    PLANO_GRATUITO,
    QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO,
} from "@/constants";
import { cn } from "@/lib/utils";
import { Plano, SubPlano } from "@/types/plano";
import { getMaiorSubplanoCompleto } from "@/utils/domain/plano/planoStructureUtils";
import { toast } from "@/utils/notifications/toast";
import { Check, Loader2 } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";

interface PlanoCardProps {
  plano: Plano;
  subPlanos: SubPlano[];
  isSelected: boolean;
  onSelect: (planoId: string) => void;
  // Props para o plano Completo
  selectedSubPlanoId?: string | null;
  quantidadePersonalizada?: string;
  onSubPlanoSelect?: (subPlanoId: string | undefined) => void;
  onQuantidadePersonalizadaChange?: (value: string) => void;
  precoCalculadoPreview?: number | null;
  valorPorCobranca?: number | null;
  isCalculandoPreco?: boolean;
  getQuantidadeMinima?: () => number | null;
  onQuantidadePersonalizadaConfirm?: () => void;
  isSubPlanoAtivo?: (subPlanoId: string) => boolean;
  isQuantidadePersonalizadaAtiva?: boolean;
  onAvancarStep?: () => void;
  cardClassName?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionButtonClassName?: string;
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void;
  hideActionButton?: boolean;
  autoAdvanceOnSubPlanoSelect?: boolean;
}

export const PlanoCard = ({
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
  isSubPlanoAtivo,
  isQuantidadePersonalizadaAtiva = false,
  onAvancarStep,
  cardClassName,
  actionLabel,
  actionDisabled,
  actionButtonClassName,
  onAction,
  hideActionButton = false,
  autoAdvanceOnSubPlanoSelect = true,
}: PlanoCardProps) => {
  const isCompleto = plano.slug === PLANO_COMPLETO;
  const isGratuito = plano.slug === PLANO_GRATUITO;
  const isEssencial = plano.slug === PLANO_ESSENCIAL;

  // Estado local para controlar se o personalizado foi clicado e se o slider está expandido
  const [personalizadoClicado, setPersonalizadoClicado] = useState(false);
  const [sliderExpandido, setSliderExpandido] = useState(false);

  // Sub-planos do Completo
  const subPlanosCompleto = isCompleto
    ? subPlanos.filter((s) => s.parent_id === plano.id)
    : [];

  // Ordenar sub-planos por franquia (menor para maior)
  const subPlanosOrdenados = [...subPlanosCompleto].sort(
    (a, b) => a.franquia_cobrancas_mes - b.franquia_cobrancas_mes
  );

  // Obter menor sub-plano (para seleção automática)
  const menorSubplano = subPlanosOrdenados[0] || null;

  // Obter maior sub-plano para calcular mínimo do slider
  const maiorSubplano = isCompleto
    ? getMaiorSubplanoCompleto([plano], subPlanosCompleto)
    : null;
  const quantidadeMinimaSlider = maiorSubplano
    ? maiorSubplano.franquia_cobrancas_mes + 1
    : 0;

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
    isCompleto && quantidadeMinimaSlider > 0
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

  // Handler para mudança de quantidade personalizada
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

  // Handler para seleção de sub-plano via pill
  const handleSubPlanoSelect = (subPlanoId: string) => {
    onSelect(plano.id);

    const isAtivo = isSubPlanoAtivo ? isSubPlanoAtivo(subPlanoId) : false;
    if (isAtivo) {
      return; // Não permitir seleção se está ativo
    }

    setPersonalizadoClicado(false);
    setSliderExpandido(false);
    onSubPlanoSelect?.(subPlanoId);
    onQuantidadePersonalizadaChange?.("");

    // Removido auto-advance - usuário precisa clicar no botão
  };

  // Resetar estado do slider quando selecionar outro plano ou limpar seleção
  useEffect(() => {
    if (!isSelected && sliderExpandido) {
      setSliderExpandido(false);
      setPersonalizadoClicado(false);
    }
  }, [isSelected, sliderExpandido]);

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
    // Isso é necessário para que a requisição de preview funcione corretamente
    if (selectedSubPlanoId) {
      onSubPlanoSelect?.(undefined);
    }
    // Aguardar um tick para garantir que o sub-plano foi limpo antes de definir a quantidade
    // Isso evita que a requisição seja bloqueada pela verificação de sub_plano_id
    setTimeout(() => {
      // Definir valor inicial como o mínimo do slider (maior sub-plano + 1)
      if (quantidadeMinimaSlider > 0 && !quantidadePersonalizada) {
        onQuantidadePersonalizadaChange?.(String(quantidadeMinimaSlider));
      }
      // Scroll suave para baixo após expandir o slider
      setTimeout(() => {
        // Buscar o elemento do slider expandido
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
    // NÃO limpar o sub-plano aqui - só limpar quando o usuário começar a digitar
    if (!personalizadoClicado) {
      handlePersonalizadoSelect();
    }
  };

  const getTag = (slug: string) => {
    switch (slug) {
      case PLANO_ESSENCIAL:
        return null;
      case PLANO_COMPLETO:
        return { text: "Mais Popular" };
      case PLANO_GRATUITO:
        return null;
      default:
        return null;
    }
  };

  const tag = getTag(plano.slug);

  // Calcular preço dinâmico baseado na seleção (usando useMemo para evitar re-renders desnecessários)
  const precoExibido = useMemo(() => {
    if (isCompleto) {
      // Se tem quantidade personalizada, só mostrar preço se for válida
      if (quantidadePersonalizada) {
        // Se a quantidade não é válida, retornar null para mostrar loader
        if (!isQuantidadeValida) {
          return null;
        }
        // Se tem preço calculado e quantidade válida, retornar o preço
        if (precoCalculadoPreview !== null) {
          return precoCalculadoPreview;
        }
        // Se ainda está calculando, retornar null
        return null;
      }
      // Se tem sub-plano selecionado, usar o preço dele
      if (selectedSubPlanoId) {
        const subPlano = subPlanosCompleto.find(
          (s) => s.id === selectedSubPlanoId
        );
        if (subPlano) {
          return subPlano.promocao_ativa && subPlano.preco_promocional
            ? subPlano.preco_promocional
            : subPlano.preco;
        }
      }
      // Caso contrário, mostrar o menor preço (a partir de)
      return Math.min(
        ...(subPlanosCompleto.map((s) =>
          Number(s.promocao_ativa ? s.preco_promocional : s.preco)
        ) || [0])
      );
    }

    // Para outros planos, usar preço normal
    return plano.promocao_ativa && plano.preco_promocional
      ? plano.preco_promocional
      : plano.preco;
  }, [
    isCompleto,
    selectedSubPlanoId,
    subPlanosCompleto,
    precoCalculadoPreview,
    quantidadePersonalizada,
    isQuantidadeValida,
    plano,
  ]);

  // Preço original (sem promoção) para exibir riscado quando houver promoção
  const precoOriginal = isCompleto
    ? Math.min(...(subPlanosCompleto.map((s) => Number(s.preco)) || [0]))
    : plano.preco;

  // Função para obter o prefixo das features
  const getFeaturesPrefix = () => {
    if (isGratuito) {
      return "Este plano inclui:";
    }
    if (isEssencial) {
      return "Tudo do Gratuito, mais:";
    }
    if (isCompleto) {
      return "Tudo do Essencial, mais:";
    }
    return "";
  };

  const featuresPrefix = getFeaturesPrefix();

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

  // Função para obter o texto do botão baseado no plano
  // Se actionLabel for fornecido (página /planos), usa-o. Caso contrário, usa textos padrão (página /cadastro)
  const getButtonText = (): string => {
    // Prioridade: actionLabel (quando fornecido) > textos padrão por plano
    if (actionLabel) {
      return actionLabel;
    }
    
    // Textos padrão apenas quando não há actionLabel (página /cadastro)
    if (isGratuito) {
      return "Escolher Plano";
    }
    if (isEssencial) {
      return "Testar 7 dias grátis";
    }
    if (isCompleto) {
      return "Quero Automatizar";
    }
    return "Escolher Plano";
  };

  return (
    <Card
      className={cn(
        "relative p-5 flex flex-col transition-all duration-300 h-full border-2 shadow-md hover:shadow-lg overflow-hidden",
        isCompleto ? "border-blue-600" : "border-gray-200",
        cardClassName
      )}
    >
      {tag && (
        <div
          className={cn(
            "absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white uppercase transition-colors duration-300 z-10",
            "bg-blue-600"
          )}
        >
          {tag.text}
        </div>
      )}

      <CardContent className={cn("p-0 flex flex-col flex-grow")}>
        {/* 1. Nome do Plano */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl font-extrabold text-gray-800">
            {plano.nome}
          </h3>
        </div>

        {/* 2. Descrição */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {plano.descricao_curta}
        </p>

        {/* 3. Preço */}
        <div className="mb-4">
          {isGratuito && (
            <>
              <div className="text-sm text-gray-600 mb-1">
                <span>Para quem está começando.</span>
              </div>
              <span className="text-3xl font-extrabold text-gray-900">
                R$ 0
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Grátis para sempre.{" "}
                <span className="font-medium text-gray-700">
                  Com restrições de uso.
                </span>
              </div>
            </>
          )}

          {!isGratuito && !isCompleto && (
            <>
              {plano.promocao_ativa && plano.preco_promocional ? (
                <>
                  <div className="text-sm text-gray-600 mb-1">
                    Por apenas{" "}
                    <span className="text-gray-500 line-through">
                      {precoOriginal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {precoExibido?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span className="text-gray-500 font-semibold">/mês</span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {precoExibido?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span className="text-gray-500 font-semibold">/mês</span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Renovação mensal, sem fidelidade.
              </div>
            </>
          )}

          {isCompleto && (
            <>
              {isCalculandoPreco ||
              (quantidadePersonalizada && precoExibido === null) ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
              ) : !selectedSubPlanoId &&
                !precoCalculadoPreview &&
                !quantidadePersonalizada ? (
                <>
                  <div className="text-sm text-gray-600 mb-1">A partir de</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {precoExibido?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span className="text-gray-500 font-semibold">/mês</span>
                  </div>
                </>
              ) : precoExibido !== null ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {precoExibido?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span className="text-gray-500 font-semibold">/mês</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Renovação mensal, sem fidelidade.
              </div>
            </>
          )}
        </div>

        {/* 5. Seletor de Quantidade - Apenas para Plano Completo (ACIMA do botão) */}
        {isCompleto && (
          <div className="mb-4 space-y-2">
            {/* Pills para sub-planos pré-definidos - Lado a lado */}
            <div className="grid grid-cols-3 gap-2">
              {subPlanosOrdenados.map((subPlano) => {
                const isAtivo = isSubPlanoAtivo
                  ? isSubPlanoAtivo(subPlano.id)
                  : false;
                const isSelecionado = selectedSubPlanoId === subPlano.id;

                return (
                  <button
                    key={subPlano.id}
                    type="button"
                    onClick={() => handleSubPlanoSelect(subPlano.id)}
                    disabled={isAtivo}
                    className={cn(
                      "relative px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center justify-center",
                      isAtivo
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300"
                        : isSelecionado
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
                    )}
                  >
                    {isAtivo && (
                      <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white bg-gray-700 rounded-full z-10">
                        Atual
                      </div>
                    )}
                    <span
                      className={cn(
                        "text-sm font-normal",
                        isSelecionado ? "text-white" : "text-gray-700"
                      )}
                    >
                      {subPlano.franquia_cobrancas_mes}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Texto abaixo dos pills */}
            <div className="text-xs text-gray-600 text-center">
              Passageiros com Cobrança Automática
            </div>

            {/* Link para expandir slider personalizado */}
            {!sliderExpandido && subPlanosOrdenados.length > 0 && (
              <button
                type="button"
                onClick={handleExpandirSlider}
                className="text-sm text-blue-600 hover:text-blue-700 underline font-medium w-full text-center"
              >
                Personalizar quantidade
              </button>
            )}

            {/* Opção Personalizada - Slider expandível */}
            {sliderExpandido && (
              <div
                id={`custom-quantity-section-${plano.id}`}
                className={cn(
                  "relative flex flex-col gap-3 p-4 rounded-lg border-2 transition-colors bg-white",
                  personalizadoClicado || quantidadePersonalizada
                    ? "bg-slate-50"
                    : "border-gray-200"
                )}
              >
                {isQuantidadePersonalizadaAtiva && (
                  <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 text-[10px] font-bold text-white bg-gray-700 rounded-full z-10 shadow-md">
                    Plano atual
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">
                      Escolha a quantidade:
                    </div>
                  </div>
                </div>

                {/* Número grande em destaque */}
                <div className="text-center">
                  {quantidadePersonalizada ? (
                    <span
                      className={cn(
                        "text-3xl font-extrabold",
                        quantidadeMinima && !isQuantidadeValida
                          ? "text-gray-400"
                          : "text-blue-600"
                      )}
                    >
                      {quantidadePersonalizada}
                    </span>
                  ) : (
                    <span className="text-3xl font-extrabold text-gray-400">
                      0
                    </span>
                  )}
                  <span className="text-sm text-gray-600 ml-1">
                    passageiros
                  </span>
                </div>

                {/* Slider */}
                <div className="px-2">
                  <Slider
                    value={[
                      quantidadePersonalizada
                        ? parseInt(quantidadePersonalizada)
                        : quantidadeMinimaSlider,
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
                    className="w-full"
                  />
                </div>

                {/* Input de apoio */}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id={`quantidade-personalizada-${plano.id}`}
                    type="number"
                    min={quantidadeMinimaSlider}
                    max={QUANTIDADE_MAXIMA_PASSAGEIROS_CADASTRO}
                    inputMode="numeric"
                    value={quantidadePersonalizada}
                    onChange={(e) => {
                      handleQuantidadeChange(e.target.value);
                      if (!personalizadoClicado) {
                        handlePersonalizadoSelect();
                      }
                    }}
                    onFocus={handleInputFocus}
                    className={cn(
                      "w-20 bg-gray-50 text-sm rounded-sm border text-center focus-visible:outline-none",
                      quantidadePersonalizada && !isQuantidadeValida
                        ? "border-amber-500 focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500"
                        : "border-gray-300 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
                    )}
                    placeholder={
                      quantidadeMinimaSlider > 0
                        ? `Mín: ${quantidadeMinimaSlider}`
                        : "0"
                    }
                  />
                  <span className="text-xs text-gray-500">passageiros</span>
                </div>

                {personalizadoClicado &&
                  quantidadeDigitada < quantidadeMinimaParaValidacao && (
                    <div className="mt-1">
                      <p className="text-amber-600 text-xs font-medium">
                        Para até {quantidadeMinimaParaValidacao - 1}{" "}
                        passageiros, use os botões acima.
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* 4. Botão CTA */}
        {isCompleto ? (
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              // Validar se há seleção válida
              if (!opcaoSelecionada) {
                toast.error("plano.erro.escolher", {
                  description: "plano.erro.selecionarQuantidade",
                });
                return;
              }

              // Se selecionou personalizada, validar quantidade
              if (opcaoSelecionada === "personalizado") {
                if (!quantidadePersonalizada) {
                  toast.error("plano.erro.escolher", {
                    description: "plano.erro.informarQuantidadePersonalizada",
                  });
                  const input = document.getElementById(
                    `quantidade-personalizada-${plano.id}`
                  ) as HTMLInputElement;
                  input?.focus();
                  return;
                }

                if (quantidadeMinima && !isQuantidadeValida) {
                  toast.error(
                    `Personalização a partir de ${quantidadeMinima} passageiros.`,
                    {
                      description: `Para quantidades menores, selecione outra opção.`,
                    }
                  );
                  const input = document.getElementById(
                    `quantidade-personalizada-${plano.id}`
                  ) as HTMLInputElement;
                  input?.focus();
                  return;
                }

                onQuantidadePersonalizadaConfirm?.();
                onAvancarStep?.();
                return;
              }

              // Se selecionou sub-plano, avançar
              if (selectedSubPlanoId) {
                onAvancarStep?.();
              }
            }}
            disabled={isCalculandoPreco}
            className={cn(
              "w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2.5",
              isCalculandoPreco && "opacity-50 cursor-not-allowed"
            )}
          >
            {getButtonText()}
          </Button>
        ) : (
          !hideActionButton && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (actionDisabled) return;
                if (onAction) {
                  onAction(e);
                } else {
                  onSelect(plano.id);
                }
              }}
              disabled={actionDisabled}
              variant={
                // Se actionButtonClassName for fornecido (página /planos), usar variant "default" e deixar className sobrescrever
                // Caso contrário, usar variants padrão (página /cadastro)
                actionButtonClassName
                  ? "default" // Variant padrão, className customizado vai sobrescrever estilos
                  : isGratuito
                  ? "ghost"
                  : isEssencial
                  ? "outline"
                  : "default"
              }
              className={cn(
                "w-full text-base font-semibold py-2.5",
                actionDisabled && "opacity-60 cursor-not-allowed",
                // Prioridade: actionButtonClassName (quando fornecido) > estilos padrão por plano
                actionButtonClassName
                  ? actionButtonClassName
                  : isGratuito
                  ? "text-primary hover:text-blue-700 hover:border-2 hover:border-blue-600 hover:bg-gray-50"
                  : isEssencial
                  ? "border-2 bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {getButtonText()}
            </Button>
          )
        )}

        {/* Separator abaixo do botão */}
        <Separator className="my-4" />

        {/* 6. Lista de Features */}
        {plano.beneficios.length > 0 && (
          <div className="flex-grow mt-1">
            {/* Prefixo das features */}
            <div className={cn("font-semibold text-gray-800 mb-3 text-base")}>
              {featuresPrefix}
            </div>

            {/* Mobile: Accordion */}
            <div className="block sm:hidden">
              {plano.beneficios.length > 0 && (
                <div className="space-y-2 text-sm">
                  {plano.beneficios.slice(0, 3).map((b, index) => (
                    <div key={index} className="flex items-start text-gray-700">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{processarBeneficio(b)}</span>
                    </div>
                  ))}
                  {plano.beneficios.length > 3 && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="beneficios" className="border-none">
                        <AccordionTrigger className="py-2 text-xs text-gray-600 hover:no-underline">
                          Ver todos os benefícios
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 text-sm">
                            {plano.beneficios.slice(3).map((b, index) => (
                              <li
                                key={index + 3}
                                className="flex items-start text-gray-700"
                              >
                                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{processarBeneficio(b)}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
            </div>

            {/* Desktop: Lista completa */}
            <ul className="hidden sm:block space-y-2 text-sm">
              {plano.beneficios.map((b, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{processarBeneficio(b)}</span>
                </li>
              ))}
            </ul>

            {isCompleto && maiorSubplano && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold block mb-1">
                    Cadastro Ilimitado:
                  </strong>
                  Cadastre todos os seus passageiros. Você poderá ativar a
                  cobrança automática para{" "}
                  <span className="font-bold text-blue-600">
                    até{" "}
                    {selectedSubPlanoId
                      ? subPlanosCompleto.find(
                          (s) => s.id === selectedSubPlanoId
                        )?.franquia_cobrancas_mes
                      : quantidadePersonalizada && isQuantidadeValida
                      ? quantidadePersonalizada
                      : maiorSubplano.franquia_cobrancas_mes}{" "}
                    passageiros
                  </span>{" "}
                  da sua escolha.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
