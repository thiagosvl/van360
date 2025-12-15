import { BeneficiosPlanoSheet } from "@/components/features/pagamento/BeneficiosPlanoSheet";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription, // eslint-disable-line @typescript-eslint/no-unused-vars
    DialogTitle
} from "@/components/ui/dialog";
import { PLANO_COMPLETO, PLANO_ESSENCIAL } from "@/constants";
import { usePlanos } from "@/hooks/api/usePlanos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import { usuarioApi } from "@/services/api/usuario.api";
import { toast } from "@/utils/notifications/toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, FileBarChart, ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

interface ContextualUpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "passageiros" | "controle_gastos" | "relatorios" | "outros";
  targetPlan: typeof PLANO_ESSENCIAL | typeof PLANO_COMPLETO;
  onConfirm?: () => void; 
  onViewAllPlans: () => void;
  onSuccess?: () => void;
}

export function ContextualUpsellDialog({
  open,
  onOpenChange,
  feature,
  targetPlan, 
  onViewAllPlans,
  onSuccess
}: ContextualUpsellDialogProps) {
  const { user } = useSession();
  const { profile, refreshProfile } = useProfile(user?.id);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: planosData } = usePlanos({ ativo: "true" }) as any;
  const planos = planosData?.bases || [];
  
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
  const [pagamentoDialog, setPagamentoDialog] = useState<{
    isOpen: boolean;
    cobrancaId: string;
    valor: number;
    nomePlano: string;
  } | null>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);

  // Find target plan data from API list
  const targetPlanData = planos.find(p => p.slug === targetPlan);
  
  // Content configuration based on feature/trigger
  const content = {
    passageiros: {
      icon: <Users className="w-6 h-6 text-yellow-600" />,
      title: "Desbloqueie Passageiros Ilimitados",
      description: "Você atingiu o limite do seu plano atual. Não pare de crescer!",
      benefitHighlight: "Passageiros Ilimitados",
    },
    controle_gastos: {
        icon: <Wallet className="w-6 h-6 text-emerald-600" />,
        title: "Controle Total de Gastos",
        description: "Registre abastecimentos e manutenções para saber seu lucro real.",
        benefitHighlight: "Gestão de Gastos e Lucro",
    },
    relatorios: {
        icon: <FileBarChart className="w-6 h-6 text-purple-600" />,
        title: "Relatórios Financeiros",
        description: "Tenha visão total do seu faturamento e despesas mensais.",
        benefitHighlight: "Relatórios Completos",
    },
    outros: {
        icon: <Zap className="w-6 h-6 text-blue-600" />,
        title: "Faça Upgrade do seu Plano",
        description: "Tenha acesso a todos os recursos profissionais.",
        benefitHighlight: "Todos os Recursos Premium",
    }
  }[feature] || {
    icon: <Zap className="w-6 h-6 text-gray-500" />,
    title: "Melhore seu Plano",
    description: "Desbloqueie novos recursos.",
    benefitHighlight: "Upgrade de Plano",
  };

  // Extract benefits dynamically
  // We show 1 highlight (contextual) + 2 from DB
  const rawBenefits = targetPlanData?.beneficios || [];
  // Ensure we don't duplicate the highlight if it happens to be in the list
  // Simple heuristic: just take first 2.
  const secondaryBenefits = rawBenefits.slice(0, 2);

  const getFinalPrice = () => {
      if (!targetPlanData) return null;
      if (targetPlanData.promocao_ativa && targetPlanData.preco_promocional) {
          return Number(targetPlanData.preco_promocional);
      }
      return Number(targetPlanData.preco);
  };

  const finalPriceValue = getFinalPrice();
  const formattedPrice = finalPriceValue !== null 
    ? finalPriceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : undefined;

  const planDetails = targetPlan === PLANO_ESSENCIAL ? {
      name: "Plano Essencial",
      price: formattedPrice || "R$ --,--",
      period: "/mês",
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700"
  } : {
      name: "Plano Completo",
      price: formattedPrice || "R$ --,--",
      period: "/mês",
      color: "bg-purple-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-700"
  };

  const handleUpgradeClick = async () => {
      if (!profile?.id) {
          toast.error("Erro de perfil", { description: "Usuário não identificado." });
          return;
      }
      
      if (!targetPlanData) {
          toast.error("Erro de plano", { description: "Plano não encontrado. Tente recarregar a página." });
          return;
      }

      try {
          setLoading(true);
          
          const result = await usuarioApi.upgradePlano({
              usuario_id: profile.id,
              plano_id: targetPlanData.id
          });

          if (result.qrCodePayload && result.cobrancaId) {
             setPagamentoDialog({
                 isOpen: true,
                 cobrancaId: String(result.cobrancaId),
                 valor: Number(result.preco_aplicado || result.valor || 0),
                 nomePlano: planDetails.name
             });
          } else {
             await refreshProfile();
             toast.success("Plano atualizado com sucesso!");
             if (onSuccess) onSuccess();
             onOpenChange(false);
          }

      } catch (error: any) {
          console.error("Erro upgrade:", error);
          toast.error("Erro ao iniciar upgrade", {
              description: error.response?.data?.error || "Verifique sua conexão e tente novamente."
          });
      } finally {
          setLoading(false);
      }
  };

  const handleClosePayment = () => {
      setPagamentoDialog(null);
      if (isPaymentVerified) {
          onOpenChange(false);
          if (onSuccess) onSuccess();
      }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
        {/* Scrollable Content Wrapper */}
        <div className="overflow-y-auto flex-1">
            {/* Header Visual */}
            <div className={cn("p-5 flex flex-col items-center text-center relative overflow-hidden", planDetails.lightColor)}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
                
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3">
                    {content.icon}
                </div>
                
                <DialogTitle className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {content.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm max-w-[260px]">
                    {content.description}
                </DialogDescription>
            </div>

            {/* Offer Body */}
            <div className="p-5 bg-white space-y-4">
                <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Recomendado</p>
                            <h3 className="font-bold text-base text-gray-900">{planDetails.name}</h3>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-xl text-gray-900">{planDetails.price}</span>
                            <span className="text-[10px] text-gray-500">{planDetails.period}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Highlight Benefit */}
                        <div className="flex items-center gap-2.5">
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", planDetails.lightColor)}>
                                <Check className={cn("w-3 h-3", planDetails.textColor)} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-bold text-gray-900 leading-tight">{content.benefitHighlight}</span>
                        </div>
                        
                        {/* Secondary Benefits from DB */}
                        {secondaryBenefits.map((benefit, idx) => (
                             <div key={idx} className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-gray-500" />
                                </div>
                                <span className="text-xs text-gray-600 leading-snug pt-0.5">{benefit}</span>
                            </div>
                        ))}
                        
                        {/* Ver todos button */}
                        <button 
                            onClick={() => setIsBenefitsOpen(true)}
                            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-2 ml-8 mt-1"
                        >
                            Ver todos os benefícios
                        </button>
                        
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                    <Button 
                        className={cn("w-full h-11 font-bold text-sm shadow-lg shadow-indigo-100", planDetails.color, "hover:opacity-90 transition-opacity")}
                        onClick={handleUpgradeClick}
                        disabled={loading || !targetPlanData}
                    >
                        {loading ? "Processando..." : `Ativar ${planDetails.name}`}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-80" />}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        className="w-full h-9 text-xs text-gray-500 hover:text-gray-700 font-medium"
                        onClick={onViewAllPlans}
                    >
                        Comparar todos os planos
                    </Button>
                </div>
                
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pb-1">
                    <ShieldCheck className="w-3 h-3" />
                    Pagamento seguro via PIX (Liberação imediata)
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
    
    <BeneficiosPlanoSheet 
        open={isBenefitsOpen} 
        onOpenChange={setIsBenefitsOpen}
        planName={planDetails.name}
        benefits={rawBenefits}
    />

    {pagamentoDialog && (
        <PagamentoAssinaturaDialog
            isOpen={pagamentoDialog.isOpen}
            cobrancaId={pagamentoDialog.cobrancaId}
            valor={pagamentoDialog.valor}
            nomePlano={pagamentoDialog.nomePlano}
            usuarioId={user?.id}
            onPaymentVerified={() => {
                // Sincroniza estado local para permitir fechamento completo
                setIsPaymentVerified(true);
            }}
            onPaymentSuccess={handleClosePayment}
            onClose={handleClosePayment}
        />
    )}
    </>
  );
}
