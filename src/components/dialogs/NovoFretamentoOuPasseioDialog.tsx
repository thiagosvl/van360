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
        title="Nova Viagem"
        subtitle="Escolha o tipo de serviço"
        icon={<Plus className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-5 sm:p-6 space-y-3.5 bg-white">
        <button
          type="button"
          onClick={() => {
            safeCloseDialog(onClose);
            onSelectFretamento();
          }}
          className="w-full text-left p-4 sm:p-4.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-primary transition-all flex items-center gap-3.5 sm:gap-4 group cursor-pointer active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 bg-white text-[#0a0a0a] border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0a0a0a] text-sm tracking-tight leading-snug">
              Fretamento Privado
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Viagens particulares, eventos ou corrida fechada. Valor total com opção de sinal.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373] group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </button>

        <button
          type="button"
          onClick={() => {
            safeCloseDialog(onClose);
            onSelectPasseio();
          }}
          className="w-full text-left p-4 sm:p-4.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-primary transition-all flex items-center gap-3.5 sm:gap-4 group cursor-pointer active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 bg-white text-[#0a0a0a] border border-[#e5e5e5] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0a0a0a] text-sm tracking-tight leading-snug">
              Passeio Coletivo
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Excursões escolares ou eventos. Valor por participante, controle de vagas e link público.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373] group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </button>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
