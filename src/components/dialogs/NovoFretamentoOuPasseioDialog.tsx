import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { Compass, Ticket, ArrowRight, Plus } from "lucide-react";

interface NovoFretamentoOuPasseioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFretamento: () => void;
  onSelectPasseio: () => void;
}

export function NovoFretamentoOuPasseioDialog({
  isOpen,
  onClose,
  onSelectFretamento,
  onSelectPasseio,
}: NovoFretamentoOuPasseioDialogProps) {
  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="md">
      <BaseDialog.Header
        title="Novo Registro"
        subtitle="Escolha a modalidade do serviço extra"
        icon={<Plus className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-5 sm:p-6 space-y-3">
        <button
          type="button"
          onClick={() => {
            safeCloseDialog(onClose);
            onSelectFretamento();
          }}
          className="w-full text-left p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-[#1a3a5c] hover:bg-slate-50/70 shadow-xs transition-all flex items-start gap-3.5 group cursor-pointer active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 text-[#1a3a5c] border border-slate-100 group-hover:bg-[#1a3a5c] group-hover:text-white transition-all duration-300">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#1a3a5c] transition-colors">
                Fretamento Privado
              </h4>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1a3a5c] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Viagem de fim de semana, casamento, frete de empresa ou corrida avulsa fechada. Um único valor total com opção de sinal.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            safeCloseDialog(onClose);
            onSelectPasseio();
          }}
          className="w-full text-left p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-600 hover:bg-emerald-50/30 shadow-xs transition-all flex items-start gap-3.5 group cursor-pointer active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50/70 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                Passeio / Evento Coletivo
              </h4>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cinema, zoológico, teatro ou excursão escolar. Cobrança por participante com controle de vagas e link para confirmação dos pais.
            </p>
          </div>
        </button>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
