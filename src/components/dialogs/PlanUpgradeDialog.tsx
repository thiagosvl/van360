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
    Loader2,
    Sparkles,
    TrendingUp,
    X,
    Zap,
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
}

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  defaultTab = "essencial",
  targetPassengerCount,
  onSuccess,
  feature,
}: PlanUpgradeDialogProps) {
  const { user } = useSession();
  const { profile, plano, refreshProfile } = useProfile(user?.id);

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
  const isEssencial = planoAtualSlug === PLANO_ESSENCIAL;
  const isProfissional =
    planoAtualSlug === PLANO_PROFISSIONAL ||
    plano?.planoProfissional?.parent?.slug === PLANO_PROFISSIONAL;

  // Se o usuário já é Essencial ou Profissional, escondemos a navegação de tabs e forçamos Profissional
  const hideTabs = isEssencial || isProfissional;

  // Extrair franquia atual para base da lógica de target
  const assinatura = profile?.assinaturas_usuarios?.[0];
  const franquiaAtual =
    assinatura?.franquia_cobrancas_mes ||
    assinatura?.franquia_contratada_cobrancas ||
    0;

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
    valorAtualMensal: 0, // Placeholder
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

  // Sincronizar Tab padrão
  useEffect(() => {
    if (open) {
      // Reset states on open
      setIsPaymentVerified(false);

      if (isEssencial || isProfissional) {
        setActiveTab("profissional");
      } else {
        setActiveTab(defaultTab);
      }
    }
  }, [open, isEssencial, isProfissional, defaultTab]);

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

  useEffect(() => {
    if (open && availableFranchiseOptions.length > 0) {
      // Tenta achar um recomendado VÁLIDO (dentro dos filtrados)
      const recommended =
        availableFranchiseOptions.find((o) => o.recomendado) ||
        availableFranchiseOptions[0];
      if (recommended) setSelectedTierId(recommended.id);
    }
  }, [open, availableFranchiseOptions]);

  // Computar a opção visualizada no momento
  const currentTierOption = useMemo(() => {
    if (!availableFranchiseOptions || availableFranchiseOptions.length === 0)
      return null;

    // Tenta encontrar o selecionado
    if (selectedTierId) {
      const selected = availableFranchiseOptions.find(
        (o) => o.id === selectedTierId
      );
      if (selected) return selected;
    }

    // Fallback para o recomendado ou o primeiro da lista FILTRADA
    return (
      availableFranchiseOptions.find((o) => o.recomendado) ||
      availableFranchiseOptions[0]
    );
  }, [selectedTierId, availableFranchiseOptions]);

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
        return "essencial";
      case FEATURE_COBRANCA_AUTOMATICA:
      case FEATURE_NOTIFICACOES:
      case FEATURE_LIMITE_FRANQUIA:
        return "profissional";
      default:
        return defaultTab;
    }
  }, [feature, defaultTab]);

  // Conteúdo Específico da Dor (Trigger)
  const specificContent = useMemo(() => {
    switch (feature) {
      case FEATURE_GASTOS:
        return {
          title: "Assuma o Controle",
          desc: "Gerencie abastecimentos e manutenções com o Plano Essencial.",
        };
      case FEATURE_LIMITE_PASSAGEIROS:
        return {
          title: "Sua Frota Cresceu?",
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
          title: "Visão de Dono",
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
      title: isProfissional ? "Aumente sua Capacidade" : "Você só dirige",
      desc: isProfissional
        ? "Expanda sua franquia para automatizar mais passageiros."
        : "Cobranças e recibos automáticos, zero dor de cabeça.",
    },
  };

  // Decide o texto final: Se a aba ativa for a mesma da 'dor', usa o texto específico. Senão, genérico.
  const displayContent = useMemo(() => {
    if (specificContent && activeTab === featureTargetPlan) {
      return {
        title: specificContent.title,
        desc: specificContent.desc,
      };
    }
    return activeTab === "essencial"
      ? genericContent.essencial
      : genericContent.profissional;
  }, [activeTab, featureTargetPlan, specificContent, genericContent]);

  // Cores Dinâmicas do Header
  const requestHeaderStyle =
    activeTab === "essencial"
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
          {/* Header Dinâmico (Fixed) */}
          <div
            className={cn(
              "px-6 py-6 text-center relative overflow-hidden transition-colors duration-300 shrink-0",
              requestHeaderStyle
            )}
          >
            {/* Botão Fechar Padronizado */}
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors z-50">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Padrão de fundo sutil */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

            <DialogTitle className="text-2xl font-bold text-white relative z-10 leading-tight">
              {displayContent.title}
            </DialogTitle>
            {/* Subtitulo opcional, mais sutil */}
            <p className="text-blue-50/80 text-xs mt-1.5 relative z-10 font-medium leading-relaxed max-w-[80%] mx-auto">
              {displayContent.desc}
            </p>
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
                  className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 text-gray-500 font-semibold transition-all shadow-none"
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
                className="p-6 space-y-5 m-0 focus-visible:ring-0 outline-none"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    Grátis por 7 dias
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                      {planoEssencialData
                        ? formatCurrency(
                            Number(
                              planoEssencialData.promocao_ativa
                                ? planoEssencialData.preco_promocional
                                : planoEssencialData.preco
                            )
                          )
                        : "R$ --"}
                      <span className="text-sm font-medium text-gray-500">
                        /mês
                      </span>
                    </div>
                    {planoEssencialData?.promocao_ativa &&
                      planoEssencialData?.preco_promocional && (
                        <div className="text-xs text-gray-400 line-through font-medium">
                          {formatCurrency(Number(planoEssencialData.preco))}
                        </div>
                      )}
                  </h3>
                </div>

                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <BenefitItem text="Passageiros Ilimitados" highlighted />
                  <BenefitItem text="Organização Básica" />
                  <BenefitItem text="Suporte Prioritário" />
                </div>

                {/* Botão Ver Benefícios */}
                <button
                  onClick={() => setIsBenefitsOpen(true)}
                  className="w-full text-center text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 py-1"
                >
                  Ver todos benefícios
                  <ChevronRight className="w-3 h-3" />
                </button>

                {/* Upsell para Profissional */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Zap className="w-3 h-3 text-amber-500/70" />
                    <span>Cobrança Manual</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("profissional")}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1"
                  >
                    Quero 100% Automático
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Espaçador para garantir scroll se necessário */}
                <div className="h-4 sm:h-0" />
              </TabsContent>

              {/* Conteúdo Profissional */}
              <TabsContent
                value="profissional"
                className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none"
              >
                  {availableFranchiseOptions && availableFranchiseOptions.length > 0 ? (
                    <>
                        {/* 1. SELETOR (Segmented Control) */}
                        <div className="space-y-3">
                            <div className="text-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Quantos passageiros?
                                </span>
                            </div>
                            <div className="bg-gray-100 p-1.5 rounded-2xl flex flex-wrap justify-center gap-1.5">
                                {availableFranchiseOptions
                                    .sort((a, b) => (a?.quantidade || 0) - (b?.quantidade || 0))
                                    .map((opt) => {
                                        const isSelected = opt?.id === currentTierOption?.id;
                                        return (
                                            <button
                                                key={opt?.id}
                                                onClick={() => {
                                                    if (opt?.id) setSelectedTierId(opt.id);
                                                }}
                                                className={cn(
                                                    "flex-1 min-w-[70px] py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 border border-transparent",
                                                    isSelected
                                                        ? "bg-white text-violet-700 shadow-sm border-gray-100 scale-[1.02]"
                                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                                )}
                                            >
                                                {opt?.quantidade}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* 2. HERO SECTION (Preço) */}
                        <div className="text-center py-2 space-y-1 min-h-[100px] flex flex-col justify-center transition-all duration-300">
                             {(() => {
                                // Lógica de Renderização do Preço
                                if (currentTierOption?.isCustom) {
                                    if (customPrice) {
                                        return (
                                            <>
                                                <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
                                                    <span className="text-4xl font-bold tracking-tight">{formatCurrency(customPrice)}</span>
                                                    <span className="text-gray-400 font-medium text-lg">/mês</span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium">Plano sob medida</p>
                                            </>
                                        );
                                    }
                                    return <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />;
                                }

                                const officialPlan = planos?.find((p: any) => p.id === currentTierOption?.id);
                                if (officialPlan) {
                                    const hasPromo = officialPlan.promocao_ativa && officialPlan.preco_promocional;
                                    const finalPrice = hasPromo ? Number(officialPlan.preco_promocional) : Number(officialPlan.preco);

                                    return (
                                        <>
                                            {hasPromo && (
                                                <span className="inline-flex items-center gap-1 mx-auto bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Melhor Preço
                                                </span>
                                            )}
                                            <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
                                                <span className="text-4xl font-bold tracking-tight">{formatCurrency(finalPrice)}</span>
                                                <span className="text-gray-400 font-medium text-lg">/mês</span>
                                            </div>
                                            {hasPromo && (
                                                <p className="text-xs text-gray-400 line-through">
                                                    De {formatCurrency(Number(officialPlan.preco))}
                                                </p>
                                            )}
                                        </>
                                    );
                                }
                                return <span className="text-gray-400 text-lg">--</span>;
                            })()}
                        </div>

                        {/* 3. LISTA DE BENEFÍCIOS */}
                        <div className="space-y-4 pt-2">
                             <div className="space-y-3.5">
                                 {/* Benefícios Destaque */}
                                <BenefitItem text="Passageiros ILIMITADOS (Cadastro)" highlighted />
                                <BenefitItem 
                                    text={`Até ${currentTierOption?.quantidade || 'X'} Passageiros no Automático`} 
                                    highlighted 
                                />
                                <div className="h-px bg-gray-100 my-2" />
                                
                                <BenefitItem text="Cobrança Automática (Zap)" />
                                <BenefitItem text="Baixas de pagamento automáticas" />
                                <BenefitItem text="Envio de Recibos no Pix" />
                                <BenefitItem text="Relatórios Financeiros" />
                             </div>
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
                        <p className="text-sm text-gray-400">Carregando planos...</p>
                    </div>
                  )}
                  
                  {/* Espaçador */}
                  <div className="h-4 sm:h-0" />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Fixo (Actions) */}
          <div className="bg-white p-4 border-t border-gray-100 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-20">
            {activeTab === "essencial" ? (
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
                ) : (
                  `Ativar Plano (Até ${currentTierOption?.quantidade || 'X'} Passageiros)`
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
          activeTab === "essencial" ? "Plano Essencial" : "Plano Profissional"
        }
        benefits={
          activeTab === "essencial"
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
          context={activeTab === "profissional" ? "upgrade" : undefined}
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
