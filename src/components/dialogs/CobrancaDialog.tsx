import { CobrancaFormContent } from "@/components/forms/cobranca/CobrancaForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCobrancaForm } from "@/hooks/form/useCobrancaForm";
import { format } from "date-fns";
import {
  Loader2,
  PlusCircle,
  User,
  X
} from "lucide-react";

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
  
  const handleClose = () => {
    onClose();
  };

  const { form, onSubmit, isSubmitting } = useCobrancaForm({
    mode: "create",
    passageiroId,
    diaVencimento,
    valor: valorCobranca,
    onSuccess: () => {
        if (onCobrancaAdded) {
           onCobrancaAdded();
        }
        onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Registrar Mensalidades
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-white">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6 flex items-center gap-4">
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
                <CobrancaFormContent
                    form={form}
                    mode="create"
                    hideButtons={true}
                />
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Mensalidade"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
