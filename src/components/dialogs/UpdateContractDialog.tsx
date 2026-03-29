import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import { useUpdateContractViewModel } from "@/hooks/ui/useUpdateContractViewModel";
import { Passageiro } from "@/types/passageiro";
import { AlertCircle, CheckCircle2, FileText, Loader2, RefreshCw } from "lucide-react";

export interface UpdateContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

const UpdateContractDialog = ({ isOpen, onClose, passageiro }: UpdateContractDialogProps) => {
  const { wantsContract, setWantsContract, handleConfirm, isLoading } = useUpdateContractViewModel({
    passageiro,
    onClose,
  });

  const firstNamePassageiro = passageiro.nome?.split(" ")[0];

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BaseDialog.Header
        title="Atualizar contrato"
        subtitle={`Passageiro: ${passageiro.nome}`}
        icon={<RefreshCw className="w-5 h-5" />}
        onClose={onClose}
      />
      <BaseDialog.Body>
        <div className="space-y-5">
          <div className="flex items-start gap-4 py-2 border-b border-slate-50 pb-5">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
              <FileText className="w-6 h-6 text-[#1a3a5c] opacity-80" />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-lg sm:text-xl font-headline font-black text-[#1a3a5c] uppercase leading-tight">
                Gostaria de um novo contrato?
              </h2>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed pr-2">
                Deseja substituir o contrato atual por um novo para{" "}
                <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong>?
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
              <div
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors duration-300",
                  wantsContract
                    ? "bg-white border-emerald-200 text-emerald-600"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                )}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] font-black uppercase tracking-tight", wantsContract ? "text-emerald-900" : "text-[#1a3a5c]")}>
                  Sim, substituir contrato
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
              <div
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors duration-300",
                  !wantsContract
                    ? "bg-white border-slate-200 text-slate-600"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                )}
              >
                <div className="w-5 h-5 rounded-full border-2 border-current" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] font-black uppercase tracking-tight", !wantsContract ? "text-slate-900" : "text-[#1a3a5c]")}>
                  Não, manter o atual
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                  O contrato atual permanecerá ativo
                </p>
              </div>
            </button>
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={cn(
            "flex-1 h-12 rounded-2xl font-headline font-black uppercase tracking-widest text-[13px] transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
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
      </BaseDialog.Footer>
    </BaseDialog>
  );
};

export default UpdateContractDialog;
