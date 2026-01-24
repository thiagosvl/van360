import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FEATURE_COBRANCA_AUTOMATICA,
  FEATURE_GASTOS,
  FEATURE_LIMITE_FRANQUIA,
  FEATURE_NOTIFICACOES,
  FEATURE_RELATORIOS,
  PLANO_ESSENCIAL,
  PLANO_PROFISSIONAL,
} from "@/constants";
import { usePlanos } from "@/hooks/api/usePlanos";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { useSession } from "@/hooks/business/useSession";
import { useUpgradeFranquia } from "@/hooks/business/useUpgradeFranquia";
import { useCustomPricePreview } from "@/hooks/ui/useCustomPricePreview";
import { PlanSalesContext } from "@/types/enums";
import { useEffect, useMemo, useState } from "react";
import { EssencialPlanContent } from "./LimitAndPlan/EssencialPlanContent";
import { FooterActions } from "./LimitAndPlan/FooterActions";
import { PlanUpgradeHeader } from "./LimitAndPlan/PlanUpgradeHeader";
import { ProfissionalPlanContent } from "./LimitAndPlan/ProfissionalPlanContent";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

export interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "essencial" | "profissional";
  targetPassengerCount?: number;
  onSuccess?: () => void;
  feature?: string;
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
}: PlanUpgradeDialogProps) {
  const { user } = useSession();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const {
    profile,
    plano,
    is_essencial,
    is_profissional,
    summary: resumo,
    refreshProfile: refetchResumo,
  } = usePermissions();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: planosData } = usePlanos({ ativo: "true" }) as any;
  
  const planos = useMemo(() => {
    return [...(planosData?.bases || []), ...(planosData?.sub || [])];
  }, [planosData]);

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const trialDays = resumo?.usuario?.flags?.trial_dias_total;

  useEffect(() => {
    if (open) {
      refetchResumo();
    }
  }, [open, refetchResumo]);

  const {
    loading,
    pagamentoDialog,
    setIsPaymentVerified,
    handleUpgradeEssencial,
    handleUpgradeProfissional,
    handleClosePayment,
  } = usePlanUpgrade({
    onSuccess,
    onOpenChange,
  });

  const planoAtualSlug = plano?.slug;

  const salesContext = useMemo(() => {
    if (is_profissional) return PlanSalesContext.EXPANSION;
    if (is_essencial) return PlanSalesContext.UPGRADE_AUTO;
    return PlanSalesContext.TRIAL_CONVERSION;
  }, [is_profissional, is_essencial]);

  const isInTrial = profile?.assinatura?.status === "trial";
  const hideTabs = (is_essencial && !isInTrial) || is_profissional;

  const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
  const franquiaAtual =
    assinatura?.franquia_cobrancas_mes ||
    assinatura?.franquia_contratada_cobrancas ||
    0;

  const valorAtual = Number(assinatura?.preco_aplicado ?? assinatura?.valor);
  const passageirosAtivos = resumo?.contadores?.passageiros?.ativos;

  const targetFromProps = targetPassengerCount ?? 0;
  const targetFromAtivos = (passageirosAtivos || 0) + 1;
  let effectiveTarget = Math.max(targetFromProps, targetFromAtivos);

  if (is_profissional && effectiveTarget <= franquiaAtual) {
    effectiveTarget = franquiaAtual + 1;
  }

  const { options: franchiseOptions, calculateProrata } = useUpgradeFranquia({
    franquiaContratada: franquiaAtual,
    totalPassageiros: effectiveTarget,
    valorAtualMensal: valorAtual,
    dataVencimento: profile?.assinatura?.data_vencimento,
  });

  const minAllowedQuantity = useMemo(() => {
    const standardTiers = franchiseOptions?.filter((o) => !o.isCustom) || [];
    const maxStandardTier = Math.max(
      ...standardTiers.map((o) => o.quantidade || 0),
      0,
    );
    const current = passageirosAtivos ?? 0;

    if (current <= maxStandardTier) {
      return maxStandardTier + 1;
    }

    return current;
  }, [franchiseOptions, passageirosAtivos]);

  const planoEssencialData = planos.find(
    (p: any) => p.slug === PLANO_ESSENCIAL,
  );
  const planoProfissionalData = planos.find(
    (p: any) => p.slug === PLANO_PROFISSIONAL,
  );

  const availableFranchiseOptions = useMemo(() => {
    if (!franchiseOptions) return [];

    const filtered = franchiseOptions.filter((opt) => {
      const quantidade = opt.quantidade || 0;
      const requiredCapacity = effectiveTarget;
      
      if (quantidade < requiredCapacity) return false;
      if (is_profissional && quantidade <= franquiaAtual) return false;

      return true;
    });

    return filtered;
  }, [franchiseOptions, effectiveTarget, is_profissional, franquiaAtual]);

  const [selectedTierId, setSelectedTierId] = useState<number | string | null>(
    null,
  );

  const [isCustomQuantityMode, setIsCustomQuantityMode] = useState(false);
  const [manualQuantity, setManualQuantity] = useState<number | string>("");

  useEffect(() => {
    if (open) {
      const hasLoadedPlans = planos.length > 0;
      const noOptions = availableFranchiseOptions.length === 0;

      if (
        hasLoadedPlans &&
        noOptions &&
        !isCustomQuantityMode &&
        !franchiseOptions?.length &&
        loading === false
      ) {
         // Empty block preserved logic
      }

      if (hasLoadedPlans && noOptions && !isCustomQuantityMode) {
        if (franchiseOptions && franchiseOptions.length > 0) {
          setIsCustomQuantityMode(true);
          setManualQuantity(passageirosAtivos + 1);
          return;
        }
      }

      if (availableFranchiseOptions.length > 0) {
        const isSelectedValid = availableFranchiseOptions.some(
          (o) => o.id === selectedTierId,
        );

        if ((!selectedTierId || !isSelectedValid) && !isCustomQuantityMode) {
          const recommended =
            availableFranchiseOptions.find((o) => o.recomendado) ||
            availableFranchiseOptions[0];
          if (recommended) {
            setSelectedTierId(recommended.id);
          }
        }
      }
    }
  }, [
    open,
    availableFranchiseOptions,
    selectedTierId,
    isCustomQuantityMode,
    planos,
    passageirosAtivos,
    franchiseOptions,
    loading,
  ]);

  const currentTierOption = useMemo(() => {
    // 1. Prioritize official selection (SNAP result)
    // If user types "4" and it snaps to "5", we want to sell "5", even if input shows "4"
    if (selectedTierId) {
      const selected = availableFranchiseOptions.find(
        (o) => o.id === selectedTierId,
      );
      if (selected) return selected;
    }

    // 2. Fallback to custom manual mode (e.g. value > max tier)
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

    return availableFranchiseOptions[0] || null;
  }, [
    selectedTierId,
    availableFranchiseOptions,
    isCustomQuantityMode,
    manualQuantity,
  ]);

  const {
    customPrice,
    isDebouncing,
    isLoading: isLoadingPrice,
  } = useCustomPricePreview({
    currentTierOption: currentTierOption as {
      id: string | number;
      quantidade: number | string;
      isCustom?: boolean;
    } | null,
    planos,
    open,
    minAllowedQuantity,
  });

  const featureTargetPlan = useMemo(() => {
    switch (feature) {
      case FEATURE_GASTOS:
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

  const specificContent = useMemo(() => {
    switch (feature) {
      case FEATURE_GASTOS:
        return {
          title: "Controle Seus Gastos",
          desc: "Gerencie abastecimentos e manutenções com o Plano Essencial.",
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
          title: "Saiba seu Lucro Real",
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

  useEffect(() => {
    if (open) {
      setIsPaymentVerified(false);

      if (is_essencial || is_profissional) {
        setActiveTab(PLANO_PROFISSIONAL);
      } else if (isInTrial) {
        const planoAtualDoTrial = plano?.slug || defaultTab;
        setActiveTab(featureTargetPlan || planoAtualDoTrial);
      } else {
        setActiveTab(featureTargetPlan || defaultTab);
      }
    }
  }, [
    open,
    is_essencial,
    is_profissional,
    isInTrial,
    plano?.slug,
    defaultTab,
    featureTargetPlan,
    setIsPaymentVerified,
    setActiveTab,
  ]);

  const onUpgradeEssencial = () => {
    handleUpgradeEssencial(planoEssencialData?.id);
  };

  const onUpgradeProfissional = () => {
    const targetPlan = currentTierOption;
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
          className="w-full max-w-lg p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-none shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton
          aria-describedby="plan-upgrade-description"
        >
          <PlanUpgradeHeader
            title={
              salesContext === PlanSalesContext.EXPANSION
                ? "Aumente sua Capacidade"
                : salesContext === PlanSalesContext.UPGRADE_AUTO
                  ? "Automatize sua Cobrança"
                  : "Escolha seu Plano"
            }
          />
          <div className="sr-only">
            <span id="plan-upgrade-description">
              Selecione um plano para atualizar sua assinatura
            </span>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-1 flex flex-col overflow-hidden"
          >
            {!hideTabs && (
              <div className="px-6 pt-4 pb-2">
                <TabsList className="w-full grid grid-cols-2 h-10 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value={PLANO_ESSENCIAL}
                    className="rounded-md text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500 shadow-none data-[state=active]:shadow-sm transition-all"
                  >
                    Essencial
                  </TabsTrigger>
                  <TabsTrigger
                    value={PLANO_PROFISSIONAL}
                    className="relative rounded-md text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500 shadow-none data-[state=active]:shadow-sm transition-all"
                  >
                    Profissional
                    <span className="absolute -top-3 -right-2 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border-2 border-white transform rotate-6">
                      Mais Escolhido
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>
            )}

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <TabsContent value={PLANO_ESSENCIAL} className="m-0">
                <EssencialPlanContent
                  planoEssencialData={planoEssencialData}
                  setActiveTab={setActiveTab}
                  customHeadline={
                    activeTab === featureTargetPlan
                      ? specificContent?.title
                      : undefined
                  }
                  isInTrial={isInTrial}
                  profissionalPrice={
                    planoProfissionalData?.promocao_ativa
                      ? Number(planoProfissionalData.preco_promocional)
                      : Number(planoProfissionalData?.preco || 0)
                  }
                />
              </TabsContent>

              <TabsContent value={PLANO_PROFISSIONAL} className="m-0">
                <ProfissionalPlanContent
                  availableFranchiseOptions={availableFranchiseOptions}
                  salesContext={salesContext}
                  isCustomQuantityMode={isCustomQuantityMode}
                  setIsCustomQuantityMode={setIsCustomQuantityMode}
                  manualQuantity={manualQuantity}
                  setManualQuantity={setManualQuantity}
                  selectedTierId={selectedTierId}
                  setSelectedTierId={setSelectedTierId}
                  currentTierOption={
                    currentTierOption as { quantidade?: number | string } | null
                  }
                  customPrice={customPrice}
                  planos={planos}
                  calculateProrata={calculateProrata}
                  franquiaAtual={franquiaAtual}
                  customHeadline={
                    activeTab === featureTargetPlan
                      ? specificContent?.title
                      : undefined
                  }
                  minAllowedQuantity={minAllowedQuantity}
                  isInTrial={isInTrial}
                />
              </TabsContent>
            </div>
          </Tabs>

          <FooterActions
            activeTab={activeTab}
            loading={loading}
            onUpgradeEssencial={onUpgradeEssencial}
            onUpgradeProfissional={onUpgradeProfissional}
            planoEssencialData={planoEssencialData}
            currentTierOption={currentTierOption}
            planoAtualSlug={planoAtualSlug}
            salesContext={salesContext}
            currentPrice={(() => {
              if (activeTab === PLANO_ESSENCIAL) {
                if (!planoEssencialData) return null;
                return planoEssencialData.promocao_ativa
                  ? Number(planoEssencialData.preco_promocional)
                  : Number(planoEssencialData.preco);
              } else {
                if (currentTierOption?.isCustom && customPrice) {
                  return customPrice;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const officialPlan = planos?.find(
                  (p: any) => p.id === currentTierOption?.id,
                );
                if (officialPlan) {
                  return officialPlan.promocao_ativa
                    ? Number(officialPlan.preco_promocional)
                    : Number(officialPlan.preco);
                }
                return null;
              }
            })()}
            trialDays={trialDays}
            isLoadingPrice={isDebouncing || isLoadingPrice}
          />
        </DialogContent>
      </Dialog>

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
