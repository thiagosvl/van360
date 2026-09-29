import { CobrancaFormContent } from "@/components/forms/cobranca/CobrancaForm";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form } from "@/components/ui/form";
import { useCobrancaForm } from "@/hooks/form/useCobrancaForm";
import { CheckCircle2, PlusCircle } from "lucide-react";

interface CobrancaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  passageiroNome: string;
  passageiroResponsavelNome: string;
  valorCobranca: number;
  diaVencimento: number;
  mes?: number;
  ano?: number;
  lockFoiPago?: boolean;
  lockMesAno?: boolean;
  availableMonths?: number[];
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
  mes,
  ano,
  lockFoiPago,
  lockMesAno,
  availableMonths,
  onCobrancaAdded,
}: CobrancaDialogProps) {
  const { form, onSubmit, isSubmitting } = useCobrancaForm({
    mode: "create",
    passageiroId,
    passageiroNome,
    diaVencimento,
    valor: valorCobranca,
    mes,
    ano,
    lockFoiPago,
    onSuccess: () => {
      onCobrancaAdded?.();
      onClose();
    },
  });

  const dialogTitle = lockFoiPago ? "Registrar Pagamento" : "Registrar Parcela";
  const dialogIcon = lockFoiPago ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <PlusCircle className="w-5 h-5" />;

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title={dialogTitle} icon={dialogIcon} onClose={onClose} />
      <BaseDialog.Body>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <CobrancaFormContent
              form={form}
              mode="create"
              diaVencimento={diaVencimento}
              hideButtons={true}
              lockFoiPago={lockFoiPago}
              lockMesAno={lockMesAno}
              availableMonths={availableMonths}
            />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={isSubmitting} />
        <BaseDialog.Action label={lockFoiPago ? "Registrar" : "Registrar"} onClick={onSubmit} isLoading={isSubmitting} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
