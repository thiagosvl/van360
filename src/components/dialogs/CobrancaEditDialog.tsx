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

import { safeCloseDialog } from "@/hooks";

interface CobrancaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobranca: Cobranca;
  onCobrancaUpdated: () => void;
}

export default function CobrancaEditDialog({ isOpen, onClose, cobranca, onCobrancaUpdated }: CobrancaEditDialogProps) {
  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const { form, onSubmit, isSubmitting } = useCobrancaForm({
    mode: PassageiroFormModes.EDIT,
    cobranca,
    onSuccess: () => {
      onCobrancaUpdated();
      handleClose();
    },
  });

  if (!cobranca) return null;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <BaseDialog.Header title="Editar" icon={<Pencil className="w-5 h-5" />} onClose={handleClose} />
      <BaseDialog.Body>

        <Form {...form}>
          <CobrancaFormContent
            form={form}
            mode={PassageiroFormModes.EDIT}
            cobranca={cobranca}
            onCancel={handleClose}
            hideButtons={true}
          />
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={handleClose} disabled={isSubmitting} />
        <BaseDialog.Action label="Salvar" onClick={onSubmit} isLoading={isSubmitting} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
