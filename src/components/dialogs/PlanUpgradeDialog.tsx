
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
import { usePlanos } from "@/hooks/api/usePlanos";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useUpgradeFranquia } from "@/hooks/business/useUpgradeFranquia";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { Check, ChevronRight, Loader2, ShieldCheck, Sparkles, TrendingUp, X, Zap } from "lucide-react";
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
    feature
}: PlanUpgradeDialogProps) {
    const { user } = useSession();
    const { profile, plano, refreshProfile } = useProfile(user?.id);
    
    // API Data
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { data: planosData } = usePlanos({ ativo: "true" }) as any;
    const planos = planosData?.bases || [];

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
                setActiveTab("profissional");
            } else {
                setActiveTab(defaultTab);
            }
        }
    }, [open, isEssencial, isProfissional, defaultTab]);

    // --- Lógica do Smart Tier ---
    const smartOptions = useMemo(() => {
        if (!franchiseOptions || franchiseOptions.length === 0) return null;

        const recommended = franchiseOptions.find(o => o.recomendado) || franchiseOptions[0];
        const secondary = franchiseOptions.find(o => 
            !o.recomendado && 
            o.id !== recommended?.id && 
            o.quantidade === passageirosAtivos
        );
        
        return { recommended, secondary };
    }, [franchiseOptions, passageirosAtivos]);
    
    // --- Lógica de Texto Dinâmico (Alta Conversão) ---
    // Mapeia qual plano resolve cada dor específica
    const featureTargetPlan = useMemo(() => {
        switch (feature) {
             case FEATURE_GASTOS:
             case FEATURE_LIMITE_PASSAGEIROS:
                 return "essencial";
             case FEATURE_COBRANCA_AUTOMATICA:
             case FEATURE_NOTIFICACOES:
             case FEATURE_RELATORIOS:
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
            title: "Automatize Tudo",
            desc: "Cobrança automática, gestão financeira e mais liberdade."
        }
    };

    // Decide o texto final: Se a aba ativa for a mesma da 'dor', usa o texto específico. Senão, genérico.
    const displayContent = useMemo(() => {
        if (specificContent && activeTab === featureTargetPlan) {
            return {
                title: specificContent.title,
                description: specificContent.desc
            };
        }
        return activeTab === "essencial" ? genericContent.essencial : genericContent.profissional;
    }, [activeTab, featureTargetPlan, specificContent]);

    // Cores Dinâmicas do Header
    const requestHeaderStyle = activeTab === "essencial" 
        ? "bg-blue-600" 
        : "bg-gradient-to-r from-purple-700 to-indigo-700";

    // --- Handlers de Upgrade (Wrappers) ---

    const onUpgradeEssencial = () => {
        handleUpgradeEssencial(planoEssencialData?.id);
    };

    const onUpgradeProfissional = () => {
        const targetPlan = smartOptions?.recommended;
        const targetId = targetPlan?.id || planoCompletoData?.id;
        handleUpgradeProfissional(targetId, targetPlan);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent 
                    className="sm:max-w-[440px] p-0 overflow-hidden bg-white gap-0 rounded-3xl border-none shadow-2xl" 
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    hideCloseButton
                >
                    
                    {/* Header Dinâmico */}
                    <div className={cn("px-6 py-6 text-center relative overflow-hidden transition-colors duration-300", requestHeaderStyle)}>
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
                             {displayContent.description}
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {!hideTabs && (
                            <TabsList className="w-full grid grid-cols-2 rounded-none h-14 bg-gray-50 border-b border-gray-100 p-0">
                                <TabsTrigger 
                                    value="essencial" 
                                    className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-gray-500 font-semibold transition-all shadow-none"
                                >
                                    Essencial
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="profissional"
                                    className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 text-gray-500 font-semibold transition-all shadow-none"
                                >
                                    Profissional
                                </TabsTrigger>
                            </TabsList>
                        )}

                            {/* Conteúdo Essencial */}
                        <TabsContent value="essencial" className="p-6 space-y-5 focus-visible:ring-0 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
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
                                <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                                    Destrave cadastro ilimitado e organize sua operação básica.
                                </p>
                            </div>

                            <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <BenefitItem text="Passageiros Ilimitados" highlighted />
                                <BenefitItem text="Organização Básica" />
                                <BenefitItem text="Suporte Prioritário" />
                                <div className="pt-2 border-t border-gray-200/60 mt-2">
                                    <div className="flex items-start gap-2 text-xs text-gray-500">
                                        <div className="mt-0.5"><Zap className="w-3 h-3 text-amber-500" /></div>
                                        <span>Cobrança Manual (Você envia o PIX)</span>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all text-base"
                                onClick={onUpgradeEssencial}
                                disabled={loading || !planoEssencialData}
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Ativar Essencial"}
                            </Button>
                        </TabsContent>

                        {/* Conteúdo Profissional */}
                        <TabsContent value="profissional" className="p-6 space-y-5 focus-visible:ring-0 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                            {/* Seletor de Tiers (Se houver opções) */}
                            {smartOptions && (smartOptions.secondary || smartOptions.recommended) && (
                                <div className="flex justify-center gap-2 mb-2">
                                    {[smartOptions.secondary, smartOptions.recommended].filter(Boolean).sort((a,b) => (a?.quantidade||0) - (b?.quantidade||0)).map((opt) => (
                                        <button
                                            key={opt?.id}
                                            onClick={() => {
                                                // Lógica simples de toggle visual
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                opt?.recomendado 
                                                    ? "bg-purple-100 border-purple-200 text-purple-700 ring-2 ring-purple-500/20" 
                                                    : "bg-white border-gray-200 text-gray-600 hover:border-purple-200"
                                            )}
                                        >
                                            {opt?.quantidade} Vagas
                                        </button>
                                    ))}
                                </div>
                            )}

                             <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
                                    <TrendingUp className="w-3 h-3" />
                                    {smartOptions?.recommended?.tipo === "tier" ? "Pacote Recomendado" : "Recomendado"}
                                </div>
                                
                                {smartOptions?.recommended ? (
                                    <>
                                        <h3 className="text-3xl font-bold text-gray-900 tracking-tight flex flex-col items-center">
                                            {(() => {
                                                const p = planos.find((x: any) => x.id === smartOptions.recommended?.id);
                                                
                                                if (p) {
                                                    const shouldUsePromo = p.promocao_ativa && p.preco_promocional;
                                                    return (
                                                        <>
                                                            <div className="flex items-baseline gap-1">
                                                                {formatCurrency(Number(shouldUsePromo ? p.preco_promocional : p.preco))}
                                                                <span className="text-sm font-medium text-gray-500">/mês</span>
                                                            </div>
                                                            {shouldUsePromo && (
                                                                <div className="text-xs text-gray-400 line-through font-medium">
                                                                    {formatCurrency(Number(p.preco))}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                }
                                                return "Sob Medida";
                                            })()}
                                        </h3>
                                        <p className="text-sm text-purple-600 font-medium">
                                            {smartOptions.recommended.quantidade} Vagas de Automação
                                        </p>
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
                                        text={`Até ${smartOptions?.recommended?.quantidade || 'X'} Alunos no Automático`} 
                                        highlighted 
                                    />
                                    <BenefitItem text="Cobrança Automática (Zap)" />
                                    <BenefitItem text="Baixas e Notificações Auto." />
                                    <BenefitItem text="Envio de Recibos no Pix" />
                                </div>
                            </div>

                            <Button 
                                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-100 transition-all text-base"
                                onClick={onUpgradeProfissional}
                                disabled={loading || !smartOptions?.recommended}
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Ativar Profissional"}
                            </Button>
                        </TabsContent>
                    </Tabs>

                    {/* Footer Comum */}
                    <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <ShieldCheck className="w-3 h-3" />
                            Pagamento Seguro
                        </div>
                        <button 
                            onClick={() => setIsBenefitsOpen(true)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 group"
                        >
                            Ver todos benefícios
                            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>
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
                    context={activeTab === "profissional" ? "upgrade" : undefined}
                    onPaymentVerified={() => setIsPaymentVerified(true)}
                    onPaymentSuccess={handleClosePayment}
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
