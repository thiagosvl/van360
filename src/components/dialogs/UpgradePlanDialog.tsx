import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { CheckCircle2, Crown, Rocket, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  description?: string;
}

export default function UpgradePlanDialog({
  open,
  onOpenChange,
  featureName = "Recurso Premium",
  description = "Este recurso é exclusivo dos planos Essencial e Completo.",
}: UpgradePlanDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden border-0 shadow-2xl bg-indigo-600 rounded-3xl"
        hideCloseButton
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white text-center relative overflow-hidden">
          <DialogClose className="absolute right-4 top-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-[60] cursor-pointer focus:outline-none focus:ring-0">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="h-10 w-10 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-inner ring-1 ring-white/30">
              <Rocket className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
            </div>
            <DialogTitle className="text-lg sm:text-2xl font-bold mb-2">
              Desbloqueie o Potencial
            </DialogTitle>
            <DialogDescription className="text-indigo-100 text-center max-w-[280px]">
              {featureName}
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-white overflow-y-auto">
          <div className="space-y-4">
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              {description}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>Envio de lembretes ilimitados</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>Gestão financeira completa</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>Suporte prioritário</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200"
              onClick={() => safeCloseDialog(() => navigate("/planos?plano=essencial"))}
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver Planos Disponíveis
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-900"
              onClick={() => onOpenChange(false)}
            >
              Agora não
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
