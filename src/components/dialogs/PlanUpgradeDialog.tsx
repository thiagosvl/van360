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
import { useCalcularPrecoPreview, usePlanos } from "@/hooks/api/usePlanos";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useUpgradeFranquia } from "@/hooks/business/useUpgradeFranquia";
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
  const { profile, plano, isEssencial, isProfissional } = useProfile(user?.id);

  // API Data
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: planosData } = usePlanos({ ativo: "true" }) as any;
  // Combine bases and subs to ensure we can find all plans by ID
  const planos = useMemo(() => {
    return [...(planosData?.bases || []), ...(planosData?.sub || [])];
  }, [planosData]);

  // Estados visuais
  const [activeTab, setActiveTab] = useState<string>(defaultTab);



  // Fetch Summary for Trial Days
  const { data: resumo } = useUsuarioResumo();
  const trialDays = resumo?.usuario?.flags?.trial_dias_total ?? 7;


  // Hook de Upgrade Unificado
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

  // Dados do Usuário
  const planoAtualSlug = plano?.slug;

  // --- Contexto de Venda (Sales Context) ---
  const salesContext = useMemo(() => {
    if (isProfissional) return "expansion"; // Já é Pro, quer mais franquia
    if (isEssencial) return "upgrade_auto"; // É Essencial, quer automação
    return "trial_conversion"; // Novo usuário em trial
  }, [isProfissional, isEssencial]);

  // Tabs apenas durante o Trial. Se já assina, esconde.
  const isInTrial = profile?.assinatura?.status === 'trial';
  const hideTabs = (isEssencial && !isInTrial) || isProfissional;

  // Extrair franquia atual para base da lógica de target
  const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
  const franquiaAtual =
    assinatura?.franquia_cobrancas_mes ||
    assinatura?.franquia_contratada_cobrancas ||
    0;

  // Robustez: Tenta pegar 'preco_aplicado' (novo padrão) ou 'valor' (velho padrão)
  const valorAtual = Number(
    assinatura?.preco_aplicado ?? assinatura?.valor ?? 0
  );

  // Definição de passageiros ativos e alvo
  const passageirosAtivos =
    resumo?.contadores?.passageiros?.ativos ??
    resumo?.contadores?.passageiros?.total ??
    profile?.estatisticas?.total_passageiros ??
    0;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.slug === PLANO_ESSENCIAL
  );
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const planoProfissionalData = planos.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.slug === PLANO_PROFISSIONAL
  );

  const availableFranchiseOptions = useMemo(() => {
    if (!franchiseOptions) return [];

    return franchiseOptions.filter((opt) => {
      const quantidade = opt.quantidade || 0;

      // 1. A capacidade do plano PRECISA comportar a frota atual (ou o alvo)
      // Isso evita que um motorista com 50 passageiros compre o plano de 25
      const requiredCapacity = targetPassengerCount ?? passageirosAtivos;
      if (quantidade < requiredCapacity) {
        return false;
      }

      // 2. Se já é Profissional (Upgrade/Expansão), só mostra planos MAIORES que o atual
      if (isProfissional && quantidade <= franquiaAtual) {
        return false;
      }

      return true;
    });
  }, [franchiseOptions, passageirosAtivos, isProfissional, franquiaAtual, targetPassengerCount]);

  const [selectedTierId, setSelectedTierId] = useState<number | string | null>(
    null
  );

  // Estados para Quantidade Personalizada
  const [isCustomQuantityMode, setIsCustomQuantityMode] = useState(false);
  const [manualQuantity, setManualQuantity] = useState<number | string>("");

  useEffect(() => {
    if (open) {
      const hasLoadedPlans = planos.length > 0;
      const noOptions = availableFranchiseOptions.length === 0;

      // Se carregou planos e E não tem opções válidas -> Auto-switch para Custom
      if (hasLoadedPlans && noOptions && !isCustomQuantityMode && !franchiseOptions?.length && loading === false) { 
         // !franchiseOptions?.length check is ambiguous (maybe hook loading?)
         // Better rely on hasLoadedPlans
      }
      
      if (hasLoadedPlans && noOptions && !isCustomQuantityMode) {
          // Só ativa se não tivermos filtrado TUDO. Se franchiseOptions estiver vazio pq useUpgradeFranquia não retornou nada, é outra coisa.
          // Mas availableFranchiseOptions filtra.
          if (franchiseOptions && franchiseOptions.length > 0) {
             setIsCustomQuantityMode(true);
             setManualQuantity(passageirosAtivos + 1);
             return;
          }
      }

      if (availableFranchiseOptions.length > 0) {
         const isSelectedValid = availableFranchiseOptions.some(o => o.id === selectedTierId);

        if ((!selectedTierId || !isSelectedValid) && !isCustomQuantityMode) {
          // Tenta achar um recomendado VÁLIDO (dentro dos filtrados)
          const recommended =
            availableFranchiseOptions.find((o) => o.recomendado) ||
            availableFranchiseOptions[0];
          if (recommended) {
            setSelectedTierId(recommended.id);
          }
        }
      }
    }
  }, [open, availableFranchiseOptions, selectedTierId, isCustomQuantityMode, planos, passageirosAtivos, franchiseOptions, loading]);

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
  const [isDebouncing, setIsDebouncing] = useState(false);
  const calcularPrecoPreview = useCalcularPrecoPreview();

  useEffect(() => {
    if (!open) return;
    if (!currentTierOption) return;

    // Debounce para evitar flood de requisições
    const timer = setTimeout(() => {
      setIsDebouncing(false); // Fim do debounce

      // Verifica se é um plano oficial (existe na lista de bases ou subs)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isOfficialPlan = planos.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.id === currentTierOption.id
      );

      // Calcular o máximo das opções padrão para validação (similar ao FranchiseTierSelector)
      const maxStandardQuantity = Math.max(
        ...(franchiseOptions || []).map((o) => o.quantidade || 0),
        0
      );
      
      const qty = Number(currentTierOption.quantidade);
      const isQuantityValid = !currentTierOption.isCustom || (qty > maxStandardQuantity);

      // Se for marcado como custom OU se não for um plano oficial (fallback), calculamos o preço
      if (
        (currentTierOption.isCustom || !isOfficialPlan) &&
        qty > 0 &&
        isQuantityValid
      ) {
        calcularPrecoPreview.mutate(qty, {
          onSuccess: (res) => {
            if (res) setCustomPrice(res.preco);
          },
        });
      } else {
        setCustomPrice(null);
      }
    }, 600); // 600ms debounce

    // Se for custom, ativa estado de debounce visual imediatamente
    if (currentTierOption.isCustom) {
      setIsDebouncing(true);
    }

    return () => {
      clearTimeout(timer);
      // Nota: Não resetamos isDebouncing aqui para manter o loading visual enquanto o usuário digita
    };
  }, [currentTierOption, planos, open, calcularPrecoPreview.mutate, franchiseOptions]);

  // --- Lógica de Texto Dinâmico (Alta Conversão) ---
  // Mapeia qual plano resolve cada dor específica
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

  // Conteúdo Específico da Dor (Trigger)
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



  // Sincronizar Tab padrão
  useEffect(() => {
    if (open) {
      // Reset states on open
      setIsPaymentVerified(false);

      if (isEssencial || isProfissional) {
        // Usuário já está pagando -> Força Profissional (upgrade ou expansão)
        setActiveTab(PLANO_PROFISSIONAL);
      } else if (isInTrial) {
        // Usuário em trial -> Abre na aba do plano que ele escolheu (respeita ancoragem de preço)
        // Se tiver feature específica, usa o plano alvo da feature
        // Senão, usa o plano atual da assinatura (ou defaultTab como fallback)
        const planoAtualDoTrial = plano?.slug || defaultTab;
        setActiveTab(featureTargetPlan || planoAtualDoTrial);
      } else {
        // Fallback: Usa o plano alvo da feature (se houver) ou cai no defaultTab
        setActiveTab(featureTargetPlan || defaultTab);
      }
    }
  }, [
    open,
    isEssencial,
    isProfissional,
    isInTrial,
    plano?.slug,
    defaultTab,
    featureTargetPlan,
    setIsPaymentVerified,
    setActiveTab,
  ]);



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
          className="w-full max-w-lg p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-none shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton
        >
          {/* Header Slim (Fixed) */}
          <PlanUpgradeHeader
            title={
              salesContext === "expansion"
                ? "Aumente sua Capacidade"
                : salesContext === "upgrade_auto"
                ? "Automatize sua Cobrança"
                : "Escolha seu Plano"
            }
          />

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

            {/* Scrollable Content Wrapper */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {/* Conteúdo Essencial */}
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

              {/* Conteúdo Profissional */}
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
                  currentTierOption={currentTierOption as { quantidade?: number | string } | null}
                  customPrice={customPrice}
                  planos={planos}
                  calculateProrata={calculateProrata}
                  franquiaAtual={franquiaAtual}
                  customHeadline={
                    activeTab === featureTargetPlan
                      ? specificContent?.title
                      : undefined
                  }
                  isInTrial={isInTrial}
                />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Fixo (Actions) */}
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
                  (p: any) => p.id === currentTierOption?.id
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
            isLoadingPrice={isDebouncing || calcularPrecoPreview.isPending}
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
