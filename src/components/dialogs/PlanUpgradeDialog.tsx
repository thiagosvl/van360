
import { BeneficiosPlanoSheet } from "@/components/features/pagamento/BeneficiosPlanoSheet";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURE_COBRANCA_AUTOMATICA, FEATURE_GASTOS, FEATURE_LIMITE_FRANQUIA, FEATURE_LIMITE_PASSAGEIROS, FEATURE_NOTIFICACOES, FEATURE_RELATORIOS, PLANO_COMPLETO, PLANO_ESSENCIAL } from "@/constants";
import { useCalcularPrecoPreview, usePlanos } from "@/hooks/api/usePlanos";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useUpgradeFranquia } from "@/hooks/business/useUpgradeFranquia";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { Check, ChevronRight, Loader2, Sparkles, TrendingUp, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

export interface PlanUpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: "essencial" | "completo";
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
    feature
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
        handleClosePayment 
    } = usePlanUpgrade({
        onSuccess,
        onOpenChange
    });

    // Dados do Usuário
    const planoAtualSlug = plano?.slug;
    const isEssencial = planoAtualSlug === PLANO_ESSENCIAL;
    const isProfissional = planoAtualSlug === PLANO_COMPLETO || plano?.planoCompleto?.parent?.slug === PLANO_COMPLETO;
    
    // Se o usuário já é Essencial ou Profissional, escondemos a navegação de tabs e forçamos Profissional
    const hideTabs = isEssencial || isProfissional;

    // Definição de passageiros ativos
    const passageirosAtivos = targetPassengerCount ?? (profile?.estatisticas?.total_passageiros || 0);

    // Hook de Franquia
    const { options: franchiseOptions, calculateProrata } = useUpgradeFranquia({
        franquiaContratada: profile?.assinatura?.franquia_cobrancas_mes || 0,
        totalPassageiros: passageirosAtivos,
        valorAtualMensal: 0, // Placeholder
        dataVencimento: profile?.assinatura?.data_vencimento
    });

    // Encontrar dados reais dos planos
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const planoEssencialData = planos.find((p: any) => p.slug === PLANO_ESSENCIAL);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const planoCompletoData = planos.find((p: any) => p.slug === PLANO_COMPLETO);

    // Sincronizar Tab padrão
    useEffect(() => {
        if (open) {
            // Reset states on open
            setIsPaymentVerified(false);
            
            if (isEssencial || isProfissional) {
                setActiveTab("completo");
            } else {
                setActiveTab(defaultTab);
            }
        }
    }, [open, isEssencial, isProfissional, defaultTab]);

    // Filtrar opções que sejam menores que a quantidade atual de passageiros
    const availableFranchiseOptions = useMemo(() => {
        if (!franchiseOptions) return [];
        return franchiseOptions.filter(opt => (opt.quantidade || 0) >= passageirosAtivos);
    }, [franchiseOptions, passageirosAtivos]);



    // --- State Local de Seleção de Tier ---
    const [selectedTierId, setSelectedTierId] = useState<number | string | null>(null);
    
    // Initializer: Sempre que abrir ou mudar as opções, seleciona o recomendado
    useEffect(() => {
        if (open && availableFranchiseOptions.length > 0) {
            // Tenta achar um recomendado VÁLIDO (dentro dos filtrados)
            const recommended = availableFranchiseOptions.find(o => o.recomendado) || availableFranchiseOptions[0];
            if (recommended) setSelectedTierId(recommended.id);
        }
    }, [open, availableFranchiseOptions]);

    // Computar a opção visualizada no momento
    const currentTierOption = useMemo(() => {
        if (!availableFranchiseOptions || availableFranchiseOptions.length === 0) return null;
        
        // Tenta encontrar o selecionado
        if (selectedTierId) {
            const selected = availableFranchiseOptions.find(o => o.id === selectedTierId);
            if (selected) return selected;
        }

        // Fallback para o recomendado ou o primeiro da lista FILTRADA
        return availableFranchiseOptions.find(o => o.recomendado) || availableFranchiseOptions[0];
    }, [selectedTierId, availableFranchiseOptions]);
    
    // --- Lógica de Preço Sob Medida (Robustez) ---
    const [customPrice, setCustomPrice] = useState<number | null>(null);
    const calcularPrecoPreview = useCalcularPrecoPreview();

    useEffect(() => {
        if (!currentTierOption) return;

        // Verifica se é um plano oficial (existe na lista de bases ou subs)
        const isOfficialPlan = planos.some((p: any) => p.id === currentTierOption.id);
        
        // Se for marcado como custom OU se não for um plano oficial (fallback), calculamos o preço
        // Isso resolve o caso "6 Vagas" que aparece como opção mas não tem ID correspondente na lista de planos
        if ((currentTierOption.isCustom || !isOfficialPlan) && currentTierOption.quantidade) {
            calcularPrecoPreview.mutate(currentTierOption.quantidade, {
                onSuccess: (res) => {
                     if (res) setCustomPrice(res.preco);
                }
            });
        } else {
            setCustomPrice(null);
        }
    }, [currentTierOption, planos]);
    
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
                 return "completo";
             default:
                 return defaultTab;
        }
    }, [feature, defaultTab]);

    // Conteúdo Específico da Dor (Trigger)
    const specificContent = useMemo(() => {
        switch (feature) {
            case FEATURE_GASTOS:
                return { title: "Assuma o Controle", desc: "Gerencie abastecimentos e manutenções com o Plano Essencial." };
            case FEATURE_LIMITE_PASSAGEIROS:
                return { title: "Sua Frota Cresceu?", desc: "Libere cadastros ilimitados migrando para o Plano Essencial." };
            case FEATURE_COBRANCA_AUTOMATICA:
                return { title: "Pare de Cobrar Manualmente", desc: "Delegue a cobrança para nós com o Plano Profissional." };
            case FEATURE_NOTIFICACOES:
                return { title: "Notificações Inteligentes", desc: "Envie lembretes automáticos e reduza a inadimplência." };
            case FEATURE_RELATORIOS:
                return { title: "Visão de Dono", desc: "Tenha relatórios financeiros detalhados para tomar melhores decisões." };
            case FEATURE_LIMITE_FRANQUIA:
                 return { title: "Aumente sua Capacidade", desc: "Ajuste sua franquia para continuar automatizando suas cobranças." };
            default:
                return null;
        }
    }, [feature]);

    // Conteúdo Genérico do Plano (Fallback)
    const genericContent = {
        essencial: {
            title: "Organize sua Frota",
            desc: "Cadastros ilimitados e controle de gastos básico."
        },
        profissional: {
            title: "Você só dirige",
            desc: "Cobranças e recibos automáticos, zero dor de cabeça."
        }
    };

    // Decide o texto final: Se a aba ativa for a mesma da 'dor', usa o texto específico. Senão, genérico.
    const displayContent = useMemo(() => {
        if (specificContent && activeTab === featureTargetPlan) {
            return {
                title: specificContent.title,
                desc: specificContent.desc
            };
        }
        return activeTab === "essencial" ? genericContent.essencial : genericContent.profissional;
    }, [activeTab, featureTargetPlan, specificContent]);

    // Cores Dinâmicas do Header
    const requestHeaderStyle = activeTab === "essencial" 
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
        const targetId = targetPlan?.isCustom ? planoCompletoData?.id : (targetPlan?.id || planoCompletoData?.id);
        
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
                    <div className={cn("px-6 py-6 text-center relative overflow-hidden transition-colors duration-300 shrink-0", requestHeaderStyle)}>
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

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
                        {!hideTabs && (
                            <TabsList className="w-full grid grid-cols-2 rounded-none h-14 bg-gray-50 border-b border-gray-100 p-0 shrink-0">
                                <TabsTrigger 
                                    value="essencial" 
                                    className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-gray-500 font-semibold transition-all shadow-none"
                                >
                                    Plano Essencial
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="completo"
                                    className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 text-gray-500 font-semibold transition-all shadow-none"
                                >
                                    Plano Completo
                                </TabsTrigger>
                            </TabsList>
                        )}

                        {/* Scrollable Content Wrapper */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {/* Conteúdo Essencial */}
                            <TabsContent value="essencial" className="p-6 space-y-5 m-0 focus-visible:ring-0 outline-none">
                                <div className="text-center space-y-2">
                                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                                        <Sparkles className="w-3 h-3" />
                                        Básico
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight flex flex-col items-center">
                                        <div className="flex items-baseline gap-1">
                                            {planoEssencialData ? formatCurrency(Number(planoEssencialData.promocao_ativa ? planoEssencialData.preco_promocional : planoEssencialData.preco)) : "R$ --"}
                                            <span className="text-sm font-medium text-gray-500">/mês</span>
                                        </div>
                                        {planoEssencialData?.promocao_ativa && planoEssencialData?.preco_promocional && (
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
                                        onClick={() => setActiveTab("completo")}
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
                            <TabsContent value="completo" className="p-6 space-y-5 m-0 focus-visible:ring-0 outline-none">
                                 <div className="text-center space-y-1 mb-4">
                                    <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                                        <TrendingUp className="w-3 h-3" />
                                        {currentTierOption?.recomendado ? "Recomendado" : "Mais Espaço"}
                                    </div>
                                    
                                    {availableFranchiseOptions && availableFranchiseOptions.length > 0 ? (
                                        <>
                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight flex flex-col items-center leading-none">
                                                {(() => {
                                                    // Usa o currentTierOption para pegar preço correto.
                                                    // A lógica aqui é visual: Mostramos o preço que será cobrado.

                                                    // 1. Se for Custom (Sob Medida)
                                                    if (currentTierOption?.isCustom) {
                                                        if (customPrice) {
                                                            return (
                                                                <div className="flex items-baseline gap-1">
                                                                    {formatCurrency(customPrice)}
                                                                    <span className="text-sm font-medium text-gray-500">/mês</span>
                                                                </div>
                                                            );
                                                        }
                                                        // Loading state for custom price
                                                        return <Loader2 className="w-6 h-6 animate-spin text-gray-300" />;
                                                    }

                                                    // 2. Se for Plano Oficial (Tier de Prateleira)
                                                    // Buscamos o plano original nos dados para checar promoções e valores
                                                    const officialPlan = planos?.find((p: any) => p.id === currentTierOption?.id);
                                                    
                                                    if (officialPlan) {
                                                        const hasPromo = officialPlan.promocao_ativa && officialPlan.preco_promocional;
                                                        const finalPrice = hasPromo ? Number(officialPlan.preco_promocional) : Number(officialPlan.preco);

                                                        return (
                                                            <div className="flex flex-col items-center">
                                                                {hasPromo && (
                                                                    <div className="self-center text-xs text-gray-400 line-through font-normal mb-[-2px]">
                                                                        De {formatCurrency(Number(officialPlan.preco))}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-baseline gap-1">
                                                                    {formatCurrency(finalPrice)}
                                                                    <span className="text-sm font-medium text-gray-500">/mês</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    // Fallback (não deveria acontecer com a nova lógica)
                                                    return <span className="text-gray-400 text-lg">--</span>;
                                                })()}
                                            </h3>
                                            {/* Tier Selector Moved Here */}
                                            {availableFranchiseOptions && availableFranchiseOptions.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-2 mt-3 mb-1">
                                                    {availableFranchiseOptions.sort((a,b) => (a?.quantidade||0) - (b?.quantidade||0)).map((opt) => (
                                                        <button
                                                            key={opt?.id}
                                                            onClick={() => {
                                                                if (opt?.id) setSelectedTierId(opt.id);
                                                            }}
                                                            className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-bold border transition-all",
                                                                opt?.id === currentTierOption?.id
                                                                    ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                                                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                                                            )}
                                                        >
                                                            {opt?.quantidade} Vagas
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {(!availableFranchiseOptions || availableFranchiseOptions.length === 0) && (
                                                 <p className="text-sm text-purple-600 font-medium mt-1">
                                                    {currentTierOption?.quantidade} Vagas de Automação
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="h-20 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Card de Destaque */}
                                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-4 rounded-xl shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors cursor-default">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                    
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-purple-600 fill-current" />
                                        Piloto Automático
                                    </h4>
                                    
                                    <div className="space-y-2.5">
                                        <BenefitItem text="Tudo do Plano Essencial" highlighted />
                                        <div className="h-px bg-purple-100 my-1"/>
                                        <BenefitItem 
                                            text={`Até ${currentTierOption?.quantidade || 'X'} Alunos no Automático`} 
                                            highlighted 
                                        />
                                        <BenefitItem text="Cobrança Automática (Zap)" />
                                        <BenefitItem text="Baixas e Notificações Auto." />
                                        <BenefitItem text="Envio de Recibos no Pix" />
                                    </div>
                                </div>

                                {/* Botão Ver Benefícios (Movido para cá) */}
                                <button 
                                    onClick={() => setIsBenefitsOpen(true)}
                                    className="w-full text-center text-xs font-semibold text-gray-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 py-1"
                                >
                                    Ver todos benefícios
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                                
                                {/* Espaçador para garantir scroll se necessário */}
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
                                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Ativar Essencial"}
                            </Button>
                         ) : (
                            <Button 
                                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-100 transition-all text-base mb-0"
                                onClick={onUpgradeProfissional}
                                disabled={loading || !currentTierOption}
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Ativar Profissional"}
                            </Button>
                         )}
                    </div>

                </DialogContent>
            </Dialog>

            {/* Sheet de Detalhes */}
            <BeneficiosPlanoSheet 
                open={isBenefitsOpen}
                onOpenChange={setIsBenefitsOpen}
                planName={activeTab === "essencial" ? "Plano Essencial" : "Plano Profissional"}
                benefits={activeTab === "essencial" 
                    ? (planoEssencialData?.beneficios || ["Passageiros Ilimitados", "Suporte WhatsApp"]) 
                    : (planoCompletoData?.beneficios || ["Cobrança Automática", "Relatórios Financeiros", "Gestão de Gastos"])}
            />

            {pagamentoDialog && (
                <PagamentoAssinaturaDialog 
                    isOpen={pagamentoDialog.isOpen}
                    onClose={handleClosePayment} 
                    cobrancaId={pagamentoDialog.cobrancaId}
                    valor={pagamentoDialog.valor}
                    nomePlano={pagamentoDialog.nomePlano}
                    quantidadeAlunos={pagamentoDialog.franquia}
                    usuarioId={user?.id}
                    context={activeTab === "completo" ? "upgrade" : undefined}
                    onPaymentVerified={() => setIsPaymentVerified(true)}
                    onPaymentSuccess={handleClosePayment}
                    initialData={pagamentoDialog.initialData}
                />
            )}
        </>
    );
}

function BenefitItem({ text, highlighted = false }: { text: string; highlighted?: boolean }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                highlighted ? "bg-emerald-100" : "bg-gray-100"
            )}>
                <Check className={cn("w-3 h-3", highlighted ? "text-emerald-600" : "text-gray-500")} strokeWidth={2.5} />
            </div>
            <span className={cn("text-sm leading-tight", highlighted ? "text-gray-900 font-medium" : "text-gray-600")}>
                {text}
            </span>
        </div>
    );
}
