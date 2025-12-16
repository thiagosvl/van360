import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PLANO_COMPLETO } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { ChevronRight, RefreshCw, Settings, ShieldAlert, Zap } from "lucide-react";

interface SubscriptionSettingsProps {
  onCancelClick: () => void;
  plano?: any;
}

export function SubscriptionSettings({ onCancelClick, plano }: SubscriptionSettingsProps) {
  const { openContextualUpsellDialog, openLimiteFranquiaDialog } = useLayout();
  
  const isComplete = plano?.slug === PLANO_COMPLETO || plano?.parent?.slug === PLANO_COMPLETO;

  return (
    <Accordion type="single" collapsible className="w-full bg-transparent">
      <AccordionItem value="settings" className="border-none">
        <AccordionTrigger className="text-sm text-gray-500 font-medium hover:text-gray-800 hover:no-underline px-0 py-4">
            <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações da Assinatura
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-0 pb-2 pt-0">
            <div className="flex flex-col gap-2">
                
                <Button 
                    variant="ghost" 
                    className="w-full justify-between items-center h-auto py-3 px-2 hover:bg-gray-50 rounded-lg group"
                    onClick={() => isComplete 
                        ? openLimiteFranquiaDialog({ title: "Aumentar Limite", description: "Gerencie seus limites." })
                        : openContextualUpsellDialog({ feature: "outros" })
                    }
                >
                    <div className="flex items-start gap-3 text-left">
                        <div className="mt-0.5">
                            {isComplete ? (
                                <Zap className="w-5 h-5 text-amber-500" />
                            ) : (
                                <RefreshCw className="w-5 h-5 text-blue-500" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-gray-900 leading-none">
                                {isComplete ? "Aumentar Limites" : "Alterar Plano"}
                            </span>
                            <span className="text-xs text-gray-500 font-normal">
                                {isComplete 
                                    ? "Aumente sua franquia de cobranças" 
                                    : "Faça upgrade para acessar mais recursos"}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Button>

                <Separator className="opacity-50" />

                <Button 
                    variant="ghost" 
                    className="w-full justify-between items-center h-auto py-3 px-2 hover:bg-red-50 rounded-lg group"
                    onClick={onCancelClick}
                >
                    <div className="flex items-start gap-3 text-left">
                        <div className="mt-0.5">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-red-600 leading-none">
                                Cancelar Assinatura
                            </span>
                            <span className="text-xs text-red-400/80 font-normal">
                                A renovação automática será desativada
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-400 transition-colors" />
                </Button>

            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
