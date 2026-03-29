import { CobrancaFormContent } from "@/components/forms/cobranca/CobrancaForm";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form } from "@/components/ui/form";
import { useCobrancaForm } from "@/hooks/form/useCobrancaForm";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus, PassageiroFormModes } from "@/types/enums";
import { formatFirstName, formatShortName, getStatusColor, getStatusText } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, User } from "lucide-react";

interface CobrancaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobranca: Cobranca;
  onCobrancaUpdated: () => void;
}

export default function CobrancaEditDialog({ isOpen, onClose, cobranca, onCobrancaUpdated }: CobrancaEditDialogProps) {
  if (!cobranca) return null;

  const { form, onSubmit, isSubmitting } = useCobrancaForm({
    mode: PassageiroFormModes.EDIT,
    cobranca,
    onSuccess: () => {
      onCobrancaUpdated();
      onClose();
    },
  });

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Editar Mensalidade" icon={<Pencil className="w-5 h-5" />} onClose={onClose} />
      <BaseDialog.Body>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Referência</p>
              <p className="text-lg font-bold text-gray-900 capitalize leading-tight">
                {cobranca?.data_vencimento
                  ? format(new Date(cobranca.data_vencimento), "MMMM", { locale: ptBR })
                  : "-"}
              </p>
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm",
                getStatusColor(cobranca?.status, cobranca?.data_vencimento)
              )}
            >
              {cobranca?.status === CobrancaStatus.PAGO
                ? "PAGO"
                : getStatusText(cobranca?.status, cobranca?.data_vencimento)}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{formatShortName(cobranca?.passageiro?.nome, true)}</p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">{formatFirstName(cobranca?.passageiro?.nome_responsavel)}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <CobrancaFormContent
            form={form}
            mode={PassageiroFormModes.EDIT}
            cobranca={cobranca}
            onCancel={onClose}
            hideButtons={true}
          />
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={isSubmitting} />
        <BaseDialog.Action label="Salvar Alterações" onClick={onSubmit} isLoading={isSubmitting} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
