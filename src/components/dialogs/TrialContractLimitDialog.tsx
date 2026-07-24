import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";

export interface TrialContractLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TrialContractLimitDialog({
  isOpen,
  onClose,
  onConfirm,
}: TrialContractLimitDialogProps) {
  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BaseDialog.Header
        title="Limite de Contratos no Teste"
        icon={<Lock className="w-5 h-5 text-amber-500" />}
      />
      <BaseDialog.Body>
        <div className="space-y-4 py-2">
          {/* Card de Aviso */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-900">
                Você atingiu o limite de 3 contratos de degustação
              </h3>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                Durante o período de teste gratuito, você pode emitir até 3 contratos reais. Para liberar emissões ilimitadas para toda a sua frota, escolha um plano.
              </p>
            </div>
          </div>

          {/* Benefícios da Assinatura */}
          <div className="space-y-2 px-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Ao assinar você garante:
            </p>
            <ul className="space-y-2">
              {[
                "Emissão de contratos ilimitados em PDF",
                "Assinatura digital integrada com validade jurídica",
                "Envio fácil de links de assinatura pelo WhatsApp",
                "Gestão completa de frota, cobranças e relatórios",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <div className="flex gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs"
          >
            Depois
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-11 bg-[#1a3a5c] hover:bg-[#15304d] text-white font-bold rounded-xl text-xs shadow-md group transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform" />
            Ver Planos
          </Button>
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
