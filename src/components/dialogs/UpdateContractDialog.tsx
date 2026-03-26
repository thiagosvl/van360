import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2
} from "lucide-react";
import { useUpdateContractViewModel } from "@/hooks/ui/useUpdateContractViewModel";

export interface UpdateContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

export default function UpdateContractDialog({
  isOpen,
  onClose,
  passageiro,
}: UpdateContractDialogProps) {
  const {
    wantsContract,
    setWantsContract,
    handleConfirm,
    isLoading
  } = useUpdateContractViewModel({
    passageiro,
    onClose
  });

  const firstNamePassageiro = passageiro.nome?.split(" ")[0];

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="w-[calc(100%-1.25rem)] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-[2rem] border border-slate-200/50 shadow-diff-shadow flex flex-col max-h-[92vh]"
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between bg-white border-b border-slate-100/60 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50/50 text-[#1a3a5c] border border-slate-100 shadow-sm">
              <FileText className="w-5 h-5 opacity-80" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-lg font-headline font-black text-[#1a3a5c] uppercase tracking-tight truncate">
                Gerar novo contrato
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider uppercase tracking-widest leading-none">
                  Dados atualizados
                </span>
                <div className="flex gap-1">
                  <div className="h-1 rounded-full bg-[#1a3a5c] w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4 flex-1 overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-start gap-4 py-2">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
                <FileText className="w-6 h-6 text-[#1a3a5c] opacity-80" />
              </div>
              <div className="space-y-1 flex-1">
                <h2 className="text-lg sm:text-xl font-headline font-black text-[#1a3a5c] uppercase leading-tight">
                  Gostaria de um novo contrato?
                </h2>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed pr-2">
                  Deseja gerar um novo contrato atualizado para <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong>?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setWantsContract(true)}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                  wantsContract
                    ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-200"
                    : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                  wantsContract
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                )}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn(
                    "text-[13px] font-black uppercase tracking-tight",
                    wantsContract ? "text-emerald-900" : "text-[#1a3a5c]"
                  )}>
                    Sim, substituir contrato
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                    O responsável receberá por WhatsApp
                  </p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  wantsContract ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                )}>
                  {wantsContract && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWantsContract(false)}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                  !wantsContract
                    ? "border-slate-400 bg-slate-50 shadow-md ring-1 ring-slate-200"
                    : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                  !wantsContract
                    ? "bg-slate-400 text-white shadow-lg shadow-slate-200"
                    : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                )}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn(
                    "text-[13px] font-black uppercase tracking-tight",
                    !wantsContract ? "text-slate-900" : "text-[#1a3a5c]"
                  )}>
                    Não, manter o atual
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                    O contrato atual permanecerá ativo
                  </p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  !wantsContract ? "border-slate-400 bg-slate-400" : "border-slate-300"
                )}>
                  {!wantsContract && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50/40 flex gap-4 border-t border-slate-100/60 shrink-0">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-lg shadow-[#1a3a5c]/20 hover:shadow-xl hover:shadow-[#1a3a5c]/30 transition-all active:scale-95 border-b-2 border-black/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Confirmar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
