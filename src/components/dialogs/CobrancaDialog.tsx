import { CobrancaFormContent } from "@/components/forms/cobranca/CobrancaForm";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form } from "@/components/ui/form";
import { useCobrancaForm } from "@/hooks/form/useCobrancaForm";
import { format } from "date-fns";
import { PlusCircle, User } from "lucide-react";

interface CobrancaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  passageiroNome: string;
  passageiroResponsavelNome: string;
  valorCobranca: number;
  diaVencimento: number;
  onCobrancaAdded?: () => void;
}

export default function CobrancaDialog({
  isOpen,
  onClose,
  passageiroId,
  passageiroNome,
  passageiroResponsavelNome,
  valorCobranca,
  diaVencimento,
  onCobrancaAdded,
}: CobrancaDialogProps) {
  const { form, onSubmit, isSubmitting } = useCobrancaForm({
    mode: "create",
    passageiroId,
    diaVencimento,
    valor: valorCobranca,
    onSuccess: () => {
      onCobrancaAdded?.();
      onClose();
    },
  });

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Registrar Mensalidade" icon={<PlusCircle className="w-5 h-5" />} onClose={onClose} />
      <BaseDialog.Body>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{passageiroNome}</p>
            <p className="text-xs text-gray-500">{passageiroResponsavelNome}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Vencimento</span>
            <span className="text-sm font-bold text-gray-900">
              {form.watch("data_vencimento") ? format(form.watch("data_vencimento"), "'Dia' dd") : "-"}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <CobrancaFormContent form={form} mode="create" diaVencimento={diaVencimento} hideButtons={true} />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={isSubmitting} />
        <BaseDialog.Action label="Registrar" onClick={onSubmit} isLoading={isSubmitting} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
