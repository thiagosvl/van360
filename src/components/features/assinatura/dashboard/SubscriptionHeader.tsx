import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ASSINATURA_USUARIO_STATUS_ATIVA,
  ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO,
  ASSINATURA_USUARIO_STATUS_SUSPENSA,
  ASSINATURA_USUARIO_STATUS_TRIAL,
  PLANO_GRATUITO,
  PLANO_COMPLETO
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, CreditCard, Crown, ArrowUpCircle } from "lucide-react";

interface SubscriptionHeaderProps {
  plano: any;
  assinatura: any;
  onPagarClick: () => void;
}

export function SubscriptionHeader({ plano, assinatura, onPagarClick }: SubscriptionHeaderProps) {
  const { openContextualUpsellDialog, openLimiteFranquiaDialog } = useLayout();

  const isFree = plano?.slug === PLANO_GRATUITO;
  const isComplete = plano?.slug === PLANO_COMPLETO || plano?.parent?.slug === PLANO_COMPLETO;
  
  const status = assinatura?.status;
  const isTrial = status === ASSINATURA_USUARIO_STATUS_TRIAL;
  const isPendente = status === ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO;
  const isSuspensa = status === ASSINATURA_USUARIO_STATUS_SUSPENSA;
  const isAtiva = status === ASSINATURA_USUARIO_STATUS_ATIVA;

  const trialDaysLeft = isTrial && assinatura?.trial_end_at
    ? Math.ceil((new Date(assinatura.trial_end_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getStatusConfig = () => {
    if (isTrial) {
        return {
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: AlertTriangle,
            text: `Teste Grátis (${trialDaysLeft} dias restantes)`,
            description: "Aproveite todas as funcionalidades."
        };
    }
    if (isPendente) return { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, text: "Pagamento Pendente", description: "Regularize para evitar bloqueio." };
    if (isSuspensa) return { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, text: "Assinatura Suspensa", description: "Reative seu plano agora." };
    if (isAtiva) return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, text: "Assinatura Ativa", description: "Tudo certo com seu plano." };
    
    // Default for Free plan usually doesn't have a status strictly like "active" in the same Enum sometimes, but let's assume active or fallback
    if (isFree) return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle, text: "Plano Gratuito", description: "Funcionalidades limitadas." };

    return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle, text: "Ativo", description: "" };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handlePrimaryAction = () => {
    if (isPendente || isSuspensa) {
        onPagarClick();
        return;
    }
    if (isTrial) {
        onPagarClick(); // "Ativar agora" usually means paying
        return;
    }
    if (isFree) {
        openContextualUpsellDialog({ feature: "outros" }); // Upgrade
        return;
    }
    // Is Active and not Free
    if (isComplete) {
       openLimiteFranquiaDialog({ title: "Aumentar Limite", description: "Gerencie seus limites." });
    } else {
       openContextualUpsellDialog({ feature: "outros" }); // Upgrade from Essential
    }
  };

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden relative">
      <div className={cn("absolute top-0 left-0 w-1.5 h-full", 
        isPendente || isSuspensa ? "bg-red-500" : 
        isTrial ? "bg-yellow-500" : 
        isFree ? "bg-gray-400" : "bg-green-500"
      )} />
      
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Plan Info */}
        <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-2xl flex items-center justify-center shadow-sm", 
                isFree ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
            )}>
                {isFree ? <CreditCard className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
            </div>
            
            <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900 leading-none">
                        {plano?.nome || "Plano"}
                    </h2>
                    <Badge variant="outline" className={cn("border-0 font-medium", statusConfig.color)}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {statusConfig.text}
                    </Badge>
                </div>
                <p className="text-sm text-gray-500 max-w-md">
                    {statusConfig.description}
                    {!isFree && assinatura?.vigencia_fim && !isPendente && !isSuspensa && (
                        <span className="ml-1">
                            Renova em {new Date(assinatura.vigencia_fim).toLocaleDateString('pt-BR')}.
                        </span>
                    )}
                </p>
            </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
                size="lg" 
                onClick={handlePrimaryAction}
                className={cn(
                    "w-full md:w-auto font-semibold shadow-md transition-all hover:scale-[1.02]",
                    (isPendente || isSuspensa) ? "bg-red-600 hover:bg-red-700 text-white" :
                    isTrial ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                    isFree ? "bg-blue-600 hover:bg-blue-700 text-white" :
                    "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                )}
            >
                {isPendente || isSuspensa ? "Regularizar Pagamento" :
                 isTrial ? "Ativar Plano Agora" :
                 isFree ? "Fazer Upgrade" :
                 isComplete ? "Gerenciar Limites" : "Fazer Upgrade"}
                 
                 {(isFree || (!isComplete && !isPendente && !isSuspensa && !isTrial)) && <ArrowUpCircle className="ml-2 w-4 h-4" />}
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}
