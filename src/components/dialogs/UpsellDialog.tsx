import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualAction: () => void;
}

export function UpsellDialog({ open, onOpenChange, onManualAction }: UpsellDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-center text-xl">Automatize suas Cobranças</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Pare de perder tempo cobrando manualmente. Com a Cobrança Automática, o Van Control envia as faturas e lembretes para você.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Envio automático por E-mail e WhatsApp</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Baixa automática de pagamentos (PIX)</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Redução de inadimplência</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={() => {
              onOpenChange(false);
              navigate("/planos");
            }}
          >
            Quero testar a Automação
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500 mt-2 sm:mt-0" 
            onClick={() => {
              onOpenChange(false);
              onManualAction();
            }}
          >
            Registrar pagamento manual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
