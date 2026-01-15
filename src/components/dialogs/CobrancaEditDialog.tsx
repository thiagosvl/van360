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
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { getStatusColor, getStatusText } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Loader2, Pencil, User, X } from "lucide-react";
import { useEffect } from "react";

interface CobrancaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobranca: Cobranca;
  onCobrancaUpdated: () => void;
}

export default function CobrancaEditDialog({
  isOpen,
  onClose,
  cobranca,
  onCobrancaUpdated,
}: CobrancaEditDialogProps) {
  // Cleanup effect to ensure body is unlocked when dialog closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("overflow");
        document.body.removeAttribute("data-scroll-locked");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!cobranca) return null;

  const { form, onSubmit, isSubmitting } = useCobrancaForm({
    mode: "edit",
    cobranca,
    onSuccess: () => {
      onCobrancaUpdated();
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Pencil className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Edição de Cobrança
          </DialogTitle>
        </div>

        <div className="p-4 sm:p-6 pt-2 overflow-y-auto flex-1 bg-white">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                  Referência
                </p>
                <p className="text-lg font-bold text-gray-900 capitalize leading-tight">
                  {cobranca?.data_vencimento ? format(new Date(cobranca.data_vencimento), "MMMM", {
                    locale: ptBR,
                  }) : "-"}
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

            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {cobranca?.passageiro.nome}
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                  {cobranca?.passageiro.nome_responsavel}
                </p>
              </div>
            </div>
          </div>

          {/* Alerta de PIX */}
          {cobranca?.txid_pix && (
            <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-amber-800 mb-0.5">Atenção!</p>
                <p className="text-amber-700 leading-relaxed text-xs">
                  Ao realizar alterações de preço ou data, <strong>o PIX atual será{" "}
                  cancelado (ficará inválido) e um novo PIX será gerado</strong>.
                </p>
                {cobranca?.data_envio_ultima_notificacao && (
                  <p className="text-amber-800 font-semibold mt-1 text-xs underline">
                    Como já foi enviada, você precisará reenviar a cobrança ao
                    responsável!
                  </p>
                )}
              </div>
            </div>
          )}

          <Form {...form}>
            <CobrancaFormContent
              form={form}
              mode="edit"
              cobranca={cobranca}
              onCancel={onClose}
              hideButtons={true}
            />
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
