import { BeneficiosPlanoSheet } from "@/components/features/pagamento/BeneficiosPlanoSheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FEATURE_COBRANCA_AUTOMATICA,
  FEATURE_GASTOS,
  FEATURE_LIMITE_FRANQUIA,
  FEATURE_LIMITE_PASSAGEIROS,
  FEATURE_NOTIFICACOES,
  FEATURE_RELATORIOS,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
  PLANO_PROFISSIONAL,
} from "@/constants";
import { useCalcularPrecoPreview, usePlanos } from "@/hooks/api/usePlanos";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useUpgradeFranquia } from "@/hooks/business/useUpgradeFranquia";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  Check,
  ChevronRight,
  Crown,
  Loader2,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

export interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "essencial" | "profissional";
  targetPassengerCount?: number;
  onSuccess?: () => void;
  // Context Feature Flag
  feature?: string;
  // Custom Override
  title?: string;
  description?: string;
}

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  defaultTab = PLANO_ESSENCIAL,
  targetPassengerCount,
  onSuccess,
  feature,
  title,
  description,
}: PlanUpgradeDialogProps) {
  const { user } = useSession();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { profile, plano, isEssencial, isProfissional, refreshProfile } = useProfile(user?.id);

  // API Data
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: planosData } = usePlanos({ ativo: "true" }) as any;
  // Combine bases and subs to ensure we can find all plans by ID
  const planos = useMemo(() => {
    return [...(planosData?.bases || []), ...(planosData?.sub || [])];
  }, [planosData]);

  // Estados visuais
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);

  // Hook de Upgrade Unificado
  const {
    loading,
    pagamentoDialog,
    isPaymentVerified,
    setIsPaymentVerified,
    handleUpgradeEssencial,
    handleUpgradeProfissional,
    handleClosePayment,
  } = usePlanUpgrade({
    onSuccess,
    onOpenChange,
  });

  // Dados do Usuário
  const planoAtualSlug = plano?.slug;

  // --- Contexto de Venda (Sales Context) ---
  const salesContext = useMemo(() => {
    if (isProfissional) return "expansion"; // Já é Pro, quer mais franquia
    if (isEssencial) return "upgrade_auto"; // É Essencial, quer automação
    return "acquisition"; // É Grátis/Novo, quer assinar
  }, [isProfissional, isEssencial]);

  // Se o usuário já é Essencial ou Profissional, escondemos a navegação de tabs e forçamos Profissional
  const hideTabs = isEssencial || isProfissional;

  // Extrair franquia atual para base da lógica de target
  const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
  const franquiaAtual =
    assinatura?.franquia_cobrancas_mes ||
    assinatura?.franquia_contratada_cobrancas ||
    0;
  
  // Robustez: Tenta pegar 'preco_aplicado' (novo padrão) ou 'valor' (velho padrão)
  const valorAtual = Number(assinatura?.preco_aplicado ?? assinatura?.valor ?? 0);

  // Definição de passageiros ativos e alvo
  const passageirosAtivos = profile?.estatisticas?.total_passageiros || 0;

  // Safety: Garante que sempre buscaremos uma opção MAIOR que a atual se for Profissional
  // Se target não for passado, ou for menor/igual ao limite, forçamos o próximo degrau
  let effectiveTarget =
    targetPassengerCount ??
    (passageirosAtivos > franquiaAtual ? passageirosAtivos : franquiaAtual + 1);

  if (isProfissional && effectiveTarget <= franquiaAtual) {
    effectiveTarget = franquiaAtual + 1;
  }

  // Hook de Franquia
  const { options: franchiseOptions, calculateProrata } = useUpgradeFranquia({
    franquiaContratada: franquiaAtual,
    totalPassageiros: effectiveTarget,
    valorAtualMensal: valorAtual,
    dataVencimento: profile?.assinatura?.data_vencimento,
  });

  // Encontrar dados reais dos planos
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const planoEssencialData = planos.find(
    (p: any) => p.slug === PLANO_ESSENCIAL
  );
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const planoProfissionalData = planos.find(
    (p: any) => p.slug === PLANO_PROFISSIONAL
  );



  const availableFranchiseOptions = useMemo(() => {
    if (!franchiseOptions) return [];

    return franchiseOptions.filter((opt) => {
      const quantidade = opt.quantidade || 0;

      if (quantidade < passageirosAtivos) {
        return false;
      }

      if (isProfissional && quantidade <= franquiaAtual) {
        return false;
      }

      return true;
    });
  }, [franchiseOptions, passageirosAtivos, isProfissional, franquiaAtual]);

  const [selectedTierId, setSelectedTierId] = useState<number | string | null>(
    null
  );

  // Estados para Quantidade Personalizada
  const [isCustomQuantityMode, setIsCustomQuantityMode] = useState(false);
  const [manualQuantity, setManualQuantity] = useState<number>(0);

  useEffect(() => {
    if (open && availableFranchiseOptions.length > 0) {
      if (!selectedTierId && !isCustomQuantityMode) {
        // Tenta achar um recomendado VÁLIDO (dentro dos filtrados)
        const recommended =
          availableFranchiseOptions.find((o) => o.recomendado) ||
          availableFranchiseOptions[0];
        if (recommended) {
          setSelectedTierId(recommended.id);
          setManualQuantity(recommended.quantidade || 0);
        }
      }
    }
  }, [open, availableFranchiseOptions, selectedTierId, isCustomQuantityMode]);

  // Computar a opção visualizada no momento
  const currentTierOption = useMemo(() => {
    if (isCustomQuantityMode) {
      return {
        id: "custom_manual",
        label: `${manualQuantity} Vagas`,
        quantidade: manualQuantity,
        tipo: "tier" as const,
        isCustom: true,
      };
    }

    if (!availableFranchiseOptions || availableFranchiseOptions.length === 0)
      return null;

    // Tenta encontrar o selecionado
    if (selectedTierId) {
      const selected = availableFranchiseOptions.find(
        (o) => o.id === selectedTierId
      );
      if (selected) return selected;
    }

    // Fallback para o primeiro
    return availableFranchiseOptions[0] || null;
  }, [
    selectedTierId,
    availableFranchiseOptions,
    isCustomQuantityMode,
    manualQuantity,
  ]);



  // --- Lógica de Preço Sob Medida (Robustez) ---
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const calcularPrecoPreview = useCalcularPrecoPreview();

  useEffect(() => {
    if (!open) return;
    if (!currentTierOption) return;

    // Verifica se é um plano oficial (existe na lista de bases ou subs)
    const isOfficialPlan = planos.some(
      (p: any) => p.id === currentTierOption.id
    );

    // Se for marcado como custom OU se não for um plano oficial (fallback), calculamos o preço
    // Isso resolve o caso "6 Vagas" que aparece como opção mas não tem ID correspondente na lista de planos
    if (
      (currentTierOption.isCustom || !isOfficialPlan) &&
      currentTierOption.quantidade
    ) {
      calcularPrecoPreview.mutate(currentTierOption.quantidade, {
        onSuccess: (res) => {
          if (res) setCustomPrice(res.preco);
        },
      });
    } else {
      setCustomPrice(null);
    }
  }, [currentTierOption, planos, open]);

  // --- Lógica de Texto Dinâmico (Alta Conversão) ---
  // Mapeia qual plano resolve cada dor específica
  const featureTargetPlan = useMemo(() => {
    switch (feature) {
      case FEATURE_GASTOS:
      case FEATURE_LIMITE_PASSAGEIROS:
      case FEATURE_RELATORIOS:
        return PLANO_ESSENCIAL;
      case FEATURE_COBRANCA_AUTOMATICA:
      case FEATURE_NOTIFICACOES:
      case FEATURE_LIMITE_FRANQUIA:
        return PLANO_PROFISSIONAL;
      default:
        return defaultTab;
    }
  }, [feature, defaultTab]);

  // Conteúdo Específico da Dor (Trigger)
  const specificContent = useMemo(() => {
    switch (feature) {
      case FEATURE_GASTOS:
        return {
          title: "Controle seus gastos",
          desc: "Gerencie abastecimentos e manutenções com o Plano Essencial.",
        };
      case FEATURE_LIMITE_PASSAGEIROS:
        return {
          title: "Limite de passageiros atingido",
          desc: "Libere cadastros ilimitados migrando para o Plano Essencial.",
        };
      case FEATURE_COBRANCA_AUTOMATICA:
        return {
          title: "Pare de Cobrar Manualmente",
          desc: "Delegue a cobrança para nós com o Plano Profissional.",
        };
      case FEATURE_NOTIFICACOES:
        return {
          title: "Notificações Inteligentes",
          desc: "Envie lembretes automáticos e reduza a inadimplência.",
        };
      case FEATURE_RELATORIOS:
        return {
          title: "Saiba seu lucro real",
          desc: "Tenha relatórios financeiros detalhados para tomar melhores decisões.",
        };
      case FEATURE_LIMITE_FRANQUIA:
        return {
          title: "Aumente sua Capacidade",
          desc: "Ajuste sua franquia para continuar automatizando suas cobranças.",
        };
      default:
        return null;
    }
  }, [feature]);

  // Conteúdo Genérico do Plano (Fallback)
  const genericContent = {
    essencial: {
      title: "Organize sua Frota",
      desc: "Cadastros ilimitados e controle de gastos básico.",
    },
    profissional: {
      title:
        salesContext === "expansion"
          ? "Aumente sua Capacidade"
          : "Automatize sua Cobrança",
      desc:
        salesContext === "expansion"
          ? "Expanda sua franquia para automatizar mais passageiros."
          : "Cobranças e recibos automáticos, zero dor de cabeça.",
    },
  };

  // Decide o texto final: Se a aba ativa for a mesma da 'dor', usa o texto específico. Senão, genérico.
  const displayContent = useMemo(() => {
    // 1. Custom Override (Highest Priority)
    if (title && description) {
      return { title, desc: description };
    }

    // 2. Feature Context
    if (specificContent && activeTab === featureTargetPlan) {
      return {
        title: specificContent.title,
        desc: specificContent.desc,
      };
    }

    // 3. Generic Fallback
    return activeTab === PLANO_ESSENCIAL
      ? genericContent.essencial
      : genericContent.profissional;
  }, [activeTab, featureTargetPlan, specificContent, genericContent, title, description]);

  // Sincronizar Tab padrão
  useEffect(() => {
    if (open) {
      // Reset states on open
      setIsPaymentVerified(false);

      if (isEssencial || isProfissional) {
        setActiveTab(PLANO_PROFISSIONAL);
      } else {
        // Usa o plano alvo da feature (se houver) ou cai no defaultTab
        setActiveTab(featureTargetPlan || defaultTab);
      }
    }
  }, [open, isEssencial, isProfissional, defaultTab, featureTargetPlan]);

  // Cores Dinâmicas do Header
  const requestHeaderStyle =
    activeTab === PLANO_ESSENCIAL
      ? "bg-blue-600"
      : "bg-gradient-to-r from-purple-700 to-indigo-700";

  // --- Handlers de Up grade (Wrappers) ---

  const onUpgradeEssencial = () => {
    handleUpgradeEssencial(planoEssencialData?.id);
  };

  const onUpgradeProfissional = () => {
    // Usa a opção selecionada visualmente
    const targetPlan = currentTierOption;
    // Se for custom, o ID injeatado é fictício ("custom_enterprise"), então usamos o ID do plano base
    const targetId = targetPlan?.isCustom
      ? planoProfissionalData?.id
      : targetPlan?.id || planoProfissionalData?.id;

    if (targetId) {
      handleUpgradeProfissional(targetId, targetPlan);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-full max-w-[440px] p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-none shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton
        >
          {/* Header Slim (Fixed) */}
          <div
            className={cn(
              "px-5 py-4 text-center relative overflow-hidden transition-colors duration-300 shrink-0 flex items-center justify-center min-h-[60px]",
              requestHeaderStyle
            )}
          >
            {/* Botão Fechar Padronizado - Alinhado Verticalmente */}
            <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-50 p-2 hover:bg-white/10 rounded-full">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Padrão de fundo sutil */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

            <DialogTitle className="text-xl font-bold text-white relative z-10 leading-tight">
              {displayContent.title}
            </DialogTitle>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-1 flex flex-col overflow-hidden"
          >
            {!hideTabs && (
              <TabsList className="w-full grid grid-cols-2 rounded-none h-14 bg-gray-50 border-b border-gray-100 p-0 shrink-0">
                <TabsTrigger
                  value="essencial"
                  className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-gray-500 font-semibold transition-all shadow-none"
                >
                  Plano Essencial
                </TabsTrigger>
                <TabsTrigger
                  value="profissional"
                  className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-violet-600 data-[state=active]:text-violet-700 text-gray-500 font-semibold transition-all shadow-none"
                >
                  Plano Profissional
                </TabsTrigger>
              </TabsList>
            )}

            {/* Scrollable Content Wrapper */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {/* Conteúdo Essencial */}
              <TabsContent
                value="essencial"
                className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none"
              >
                {/* 1. Hero Price (Standardized) */}
                <div className="text-center py-2 space-y-1">
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    Grátis por 7 dias
                  </div>
                  <div className="flex flex-col items-center">
                    {planoEssencialData?.promocao_ativa &&
                      planoEssencialData?.preco_promocional && (
                        <span className="text-sm text-gray-400 line-through font-medium mb-[-4px]">
                          De {formatCurrency(Number(planoEssencialData.preco))}
                        </span>
                      )}
                    <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {planoEssencialData
                          ? formatCurrency(
                              Number(
                                planoEssencialData.promocao_ativa
                                  ? planoEssencialData.preco_promocional
                                  : planoEssencialData.preco
                              )
                            )
                          : "R$ --"}
                      </span>
                      <span className="text-lg font-medium text-gray-400">
                        /mês
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Benefits List (Standardized) */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-3.5">
                    <BenefitItem text="Passageiros Ilimitados" highlighted />
                    <BenefitItem text="Organização Básica" />
                    <BenefitItem text="Suporte Prioritário" />
                  </div>
                </div>

                {/* Botão Ver Mais Benefícios */}
                <button
                  onClick={() => setIsBenefitsOpen(true)}
                  className="w-full text-center text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 py-2 mt-2"
                >
                  Ver todos recursos
                  <ChevronRight className="w-3 h-3" />
                </button>

                {/* 3. Upsell Trigger (Banner Button) */}
                <button
                  onClick={() => setActiveTab(PLANO_PROFISSIONAL)}
                  className="mt-6 w-full group relative overflow-hidden bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-300 rounded-xl p-4 transition-all duration-300 text-left"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 group-hover:bg-white flex items-center justify-center text-violet-600 transition-colors shadow-sm">
                        <Zap className="w-4 h-4 fill-current animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-violet-900 leading-tight">
                          Quer automatizar tudo?
                        </p>
                        <p className="text-xs text-violet-600/80 leading-tight mt-0.5 font-medium">
                          Veja o Plano Profissional
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-violet-400 group-hover:text-violet-700 transition-colors transform group-hover:translate-x-1" />
                  </div>
                </button>

                {/* Espaçador */}
                <div className="h-4 sm:h-0" />
              </TabsContent>

              {/* Conteúdo Profissional */}
              <TabsContent
                value="profissional"
                className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none"
              >
                {availableFranchiseOptions &&
                availableFranchiseOptions.length > 0 ? (
                  <>
                    {/* 1. SELETOR (Segmented Control Refined) */}
                    <div className="space-y-2">
                         <div className="text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {salesContext === "expansion" 
                                    ? "Nova Capacidade Desejada" 
                                    : "Tamanho da sua Frota"}
                            </span>
                        </div>

                      {/* Check if Custom Mode is Active */}
                      {isCustomQuantityMode ? (
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
                      ) : availableFranchiseOptions.length === 1 &&
                        availableFranchiseOptions[0].isCustom ? (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-center justify-between shadow-sm group cursor-pointer hover:border-violet-300 transition-all" onClick={() => setIsCustomQuantityMode(true)}>
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
                           <span className="text-xs font-bold text-violet-400 bg-white/50 px-2 py-1 rounded-lg border border-violet-100 group-hover:bg-white group-hover:text-violet-600 transition-colors">Alterar</span>
                        </div>
                      ) : (
                        <div className="bg-gray-100 p-1.5 rounded-xl flex flex-wrap justify-center gap-1.5 ring-1 ring-inset ring-black/5">
                            {availableFranchiseOptions
                              .sort(
                                (a, b) =>
                                  (a?.quantidade || 0) - (b?.quantidade || 0)
                              )
                              .map((opt, index) => {
                                const isSelected =
                                  opt?.id === currentTierOption?.id;
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
                                       isRecommended && !isSelected && "bg-violet-50/50 text-violet-600"
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
                      )}
                    </div>

                    {/* 2. HERO SECTION (Preço) */}
                    <div className="text-center py-2 space-y-0.5 min-h-[90px] flex flex-col justify-center transition-all duration-300">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">
                        Nova mensalidade total
                      </span>
                      {(() => {
                        // Lógica de Renderização do Preço
                        if (currentTierOption?.isCustom) {
                          if (customPrice) {
                            return (
                              <>
                                <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
                                  <span className="text-4xl font-extrabold tracking-tight">
                                    {formatCurrency(customPrice)}
                                  </span>
                                  <span className="text-gray-400 font-medium text-lg">
                                    /mês
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">
                                  Plano sob medida
                                </p>
                              </>
                            );
                          }
                          return (
                            <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />
                          );
                        }

                        const officialPlan = planos?.find(
                          (p: any) => p.id === currentTierOption?.id
                        );
                        if (officialPlan) {
                          const hasPromo =
                            officialPlan.promocao_ativa &&
                            officialPlan.preco_promocional;
                          const finalPrice = hasPromo
                            ? Number(officialPlan.preco_promocional)
                            : Number(officialPlan.preco);

                          return (
                            <>
                              {hasPromo ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-sm text-gray-400 line-through font-medium mb-[-4px]">
                                    De{" "}
                                    {formatCurrency(Number(officialPlan.preco))}
                                  </span>
                                  <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
                                    <span className="text-4xl font-extrabold tracking-tight">
                                      {formatCurrency(finalPrice)}
                                    </span>
                                    <span className="text-gray-400 font-medium text-lg">
                                      /mês
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
                                  <span className="text-4xl font-extrabold tracking-tight">
                                    {formatCurrency(finalPrice)}
                                  </span>
                                  <span className="text-gray-400 font-medium text-lg">
                                    /mês
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        }
                        return (
                          <span className="text-gray-400 text-lg">--</span>
                        );
                      })()}
                    </div>

                    {/* 3. INFO DINÂMICA: RESUMO FINANCEIRO (Expansão) OU BENEFÍCIOS (Migração) */}
                    <div className="space-y-4 pt-2">
                        {(() => {
                             // Cálculo do Preço Selecionado para Prorata
                             let price = 0;
                             if (currentTierOption?.isCustom && customPrice) {
                                 price = customPrice;
                             } else {
                                 const officialPlan = planos?.find((p: any) => p.id === currentTierOption?.id);
                                 if (officialPlan) {
                                     price = officialPlan.promocao_ativa 
                                        ? Number(officialPlan.preco_promocional) 
                                        : Number(officialPlan.preco);
                                 }
                             }
                             
                             const prorata = calculateProrata(price);
                             
                             if (salesContext === "expansion") {
                                 return (
                                     <div className="bg-violet-50/60 rounded-xl p-4 border border-violet-100 space-y-3">
                                         <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Capacidade</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 line-through decoration-gray-400/50 text-xs">{franquiaAtual}</span>
                                                <ChevronRight className="w-3 h-3 text-violet-400" />
                                                <span className="font-bold text-violet-700">{currentTierOption?.quantidade} Passageiros</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Próxima Mensalidade</span>
                                             <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
                                        </div>
                                        
                                        <div className="h-px bg-violet-200/50 my-1" />
                                        
                                         <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-violet-100/50">
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">Pagar Agora</span>
                                                <span className="text-[10px] text-gray-500 leading-tight">Diferença Proporcional</span>
                                            </div>
                                             <span className="text-xl font-extrabold text-violet-700">{formatCurrency(prorata.valorHoje)}</span>
                                        </div>
                                    </div>
                                 )
                             }
                             
                             // Visão Padrão (Benefícios)
                             return (
                                  <div className="space-y-3.5">
                                    <BenefitItem
                                      text="Passageiros ILIMITADOS (Cadastro)"
                                      highlighted
                                    />
                                    <BenefitItem
                                      text={`Até ${
                                        currentTierOption?.quantidade || "X"
                                      } Passageiros no Automático`}
                                      highlighted
                                    />
                                    <div className="h-px bg-gray-100 my-2" />
            
                                    <BenefitItem text="Cobrança Automática (Zap)" />
                                    <BenefitItem text="Baixas de pagamento automáticas" />
                                    <BenefitItem text="Envio de Recibos no Pix" />
                                    <BenefitItem text="Relatórios Financeiros" />
                                  </div>
                             )
                        })()}
                    </div>

                    {/* Botão Ver Mais Benefícios */}
                    <button
                      onClick={() => setIsBenefitsOpen(true)}
                      className="w-full text-center text-xs font-semibold text-gray-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-1 py-2 mt-2"
                    >
                      Ver todos recursos
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="h-40 flex items-center justify-center flex-col gap-3">
                    <Loader2 className="animate-spin text-gray-300 w-8 h-8" />
                    <p className="text-sm text-gray-400">
                      Carregando planos...
                    </p>
                  </div>
                )}

                {/* Espaçador */}
                <div className="h-4 sm:h-0" />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Fixo (Actions) */}
          <div className="bg-white p-4 border-t border-gray-100 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-20">
            {activeTab === PLANO_ESSENCIAL ? (
              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all text-base mb-0"
                onClick={onUpgradeEssencial}
                disabled={loading || !planoEssencialData}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : planoAtualSlug === PLANO_GRATUITO ? (
                  "Teste Grátis por 7 dias"
                ) : (
                  "Ativar Essencial"
                )}
              </Button>
            ) : (
              <Button
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-100 transition-all text-base mb-0"
                onClick={onUpgradeProfissional}
                disabled={loading || !currentTierOption}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : salesContext === "expansion" ? (
                  `Contratar Nova Franquia (Até ${
                    currentTierOption?.quantidade || "X"
                  } Vagas)`
                ) : salesContext === "upgrade_auto" ? (
                  `Migrar para Automático (Até ${
                    currentTierOption?.quantidade || "X"
                  } Vagas)`
                ) : (
                  `Assinar Mensal (Até ${
                    currentTierOption?.quantidade || "X"
                  } Vagas)`
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sheet de Detalhes */}
      <BeneficiosPlanoSheet
        open={isBenefitsOpen}
        onOpenChange={setIsBenefitsOpen}
        planName={
          activeTab === PLANO_ESSENCIAL ? "Plano Essencial" : "Plano Profissional"
        }
        benefits={
          activeTab === PLANO_ESSENCIAL
            ? planoEssencialData?.beneficios || [
                "Passageiros Ilimitados",
                "Suporte WhatsApp",
              ]
            : planoProfissionalData?.beneficios || [
                "Cobrança Automática",
                "Relatórios Financeiros",
                "Gestão de Gastos",
              ]
        }
      />

      {pagamentoDialog && (
        <PagamentoAssinaturaDialog
          isOpen={pagamentoDialog.isOpen}
          onClose={handleClosePayment}
          cobrancaId={pagamentoDialog.cobrancaId}
          valor={pagamentoDialog.valor}
          nomePlano={pagamentoDialog.nomePlano}
          quantidadePassageiros={pagamentoDialog.franquia}
          usuarioId={user?.id}
          context={activeTab === PLANO_PROFISSIONAL ? "upgrade" : undefined}
          onPaymentVerified={() => setIsPaymentVerified(true)}
          onPaymentSuccess={handleClosePayment}
          initialData={pagamentoDialog.initialData}
        />
      )}
    </>
  );
}

function BenefitItem({
  text,
  highlighted = false,
}: {
  text: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          highlighted ? "bg-emerald-100" : "bg-gray-100"
        )}
      >
        <Check
          className={cn(
            "w-3 h-3",
            highlighted ? "text-emerald-600" : "text-gray-500"
          )}
          strokeWidth={2.5}
        />
      </div>
      <span
        className={cn(
          "text-sm leading-tight",
          highlighted ? "text-gray-900 font-medium" : "text-gray-600"
        )}
      >
        {text}
      </span>
    </div>
  );
}
