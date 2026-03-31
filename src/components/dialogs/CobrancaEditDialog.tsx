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
        <BaseDialog.Action label="Salvar" onClick={onSubmit} isLoading={isSubmitting} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
