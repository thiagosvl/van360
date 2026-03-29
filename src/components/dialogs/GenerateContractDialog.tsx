import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Plus
} from "lucide-react";
import { useUpdateContractViewModel } from "@/hooks/ui/useUpdateContractViewModel";
import { Passageiro } from "@/types/passageiro";
import { formatShortName } from "@/utils/formatters";

export interface GenerateContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

const GenerateContractDialog = ({
  isOpen,
  onClose,
  passageiro
}: GenerateContractDialogProps) => {
  const {
    wantsContract,
    setWantsContract,
    handleConfirm,
    isLoading
  } = useUpdateContractViewModel({
    passageiro,
    onClose
  });

  const firstNamePassageiro = formatShortName(passageiro.nome);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-soft-2xl outline-none">
        <DialogHeader className="px-6 pt-7 pb-4 bg-white/80 backdrop-blur-sm border-b border-slate-50 flex-row items-center gap-4 space-y-0">
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
            <Plus className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <DialogTitle className="text-sm sm:text-lg font-headline font-black text-[#1a3a5c] uppercase tracking-tight truncate">
              Gerar contrato
            </DialogTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider uppercase tracking-widest leading-none">
                Passageiro: {formatShortName(passageiro.nome, true)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 pt-4 flex-1 overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-start gap-4 py-2">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
                <FileText className="w-6 h-6 text-[#1a3a5c] opacity-80" />
              </div>
              <div className="space-y-1 flex-1">
                <h2 className="text-lg sm:text-xl font-headline font-black text-[#1a3a5c] uppercase leading-tight">
                  Deseja gerar um contrato?
                </h2>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed pr-2">
                  Deseja gerar o contrato oficial para <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong>?
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => setWantsContract(true)}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-[1.75rem] border-2 transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98]",
                  wantsContract
                    ? "bg-emerald-50 border-emerald-500 shadow-sm"
                    : "bg-white border-slate-100 hover:border-emerald-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors duration-300",
                  wantsContract
                    ? "bg-white border-emerald-200 text-emerald-600"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-black uppercase tracking-tight",
                    wantsContract ? "text-emerald-900" : "text-[#1a3a5c]"
                  )}>
                    Sim, gerar contrato
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                    O responsável receberá por WhatsApp
                  </p>
                </div>
              </button>

              <button
                onClick={() => setWantsContract(false)}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-[1.75rem] border-2 transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98]",
                  !wantsContract
                    ? "bg-slate-50 border-slate-400 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors duration-300",
                  !wantsContract
                    ? "bg-white border-slate-200 text-slate-600"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                  <div className="w-5 h-5 rounded-full border-2 border-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-black uppercase tracking-tight",
                    !wantsContract ? "text-slate-900" : "text-[#1a3a5c]"
                  )}>
                    Não, apenas salvar
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                    O cadastro será atualizado, sem documento
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 backdrop-blur-md border-t border-slate-100">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "w-full h-14 rounded-2xl font-headline font-black uppercase tracking-widest text-[13px] transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              wantsContract
                ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600"
                : "bg-[#1a3a5c] text-white shadow-[#1a3a5c1a] hover:bg-[#152e4a]"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              "Confirmar e salvar"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateContractDialog;
