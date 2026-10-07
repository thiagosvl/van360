import { useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { safeCloseDialog } from "@/hooks";
import {
  useRegistrarPagamentoFretamentoForm,
  type RegistrarPagamentoFretamentoFormData,
} from "@/hooks/form/useRegistrarPagamentoFretamentoForm";
import { useRegistrarPagamentoFretamentoMutation } from "@/hooks/api/useFretamentosApi";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
import { formatCurrency } from "@/utils/formatters/currency";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { DollarSign, Calendar, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface RegistrarPagamentoFretamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fretamento: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export function RegistrarPagamentoFretamentoDialog({
  isOpen,
  onClose,
  fretamento,
  onSuccess,
}: RegistrarPagamentoFretamentoDialogProps) {
  const registrarMutation = useRegistrarPagamentoFretamentoMutation();

  const saldoRestante = fretamento ? Number(fretamento.saldo_restante || 0) : 0;
  const form = useRegistrarPagamentoFretamentoForm({ saldoRestante });

  useEffect(() => {
    if (isOpen && fretamento) {
      form.reset({
        valor: saldoRestante > 0 ? moneyMask(saldoRestante) : "",
        tipo_pagamento: "PIX",
        data_pagamento: new Date().toISOString().split("T")[0],
        descricao: "",
      });
    }
  }, [isOpen, fretamento, saldoRestante, form]);

  if (!fretamento) return null;

  const onSubmit = async (values: RegistrarPagamentoFretamentoFormData) => {
    try {
      await registrarMutation.mutateAsync({
        fretamentoId: fretamento.id,
        payload: {
          valor: moneyToNumber(values.valor),
          tipo_pagamento: values.tipo_pagamento,
          data_pagamento: values.data_pagamento,
          descricao: values.descricao,
        },
      });

      toast.success("Pagamento registrado com sucesso!");
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao registrar pagamento. Tente novamente.");
    }
  };

  const isSubmitting = registrarMutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="md">
      <BaseDialog.Header
        title="Registrar Pagamento"
        subtitle={`Fretamento: ${fretamento.titulo}`}
        icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <div className="mx-5 sm:mx-6 mt-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-500 block text-[11px] font-medium">Total do Frete</span>
          <span className="font-bold text-slate-800 text-sm">{formatCurrency(Number(fretamento.valor_total || 0))}</span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block text-[11px] font-medium">Já Recebido</span>
          <span className="font-bold text-emerald-600 text-sm">{formatCurrency(Number(fretamento.total_pago || 0))}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[11px] font-medium">Saldo Restante</span>
          <span className="font-bold text-orange-600 text-sm">{formatCurrency(saldoRestante)}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-4 p-5 sm:p-6 overflow-y-auto">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Valor Recebido"
                  required
                  labelClassName="text-slate-700 font-semibold ml-1 text-sm"
                  inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base font-bold text-slate-800 transition-all"
                />
              )}
            />

            <FormField
              control={form.control}
              name="tipo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">
                    Forma de Pagamento <span className="text-red-600">*</span>
                  </FormLabel>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10 pointer-events-none" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">
                    Data do Recebimento <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                      <Input
                        type="date"
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1 text-sm">Descrição / Observação</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                      <Input
                        placeholder="Ex: Quitação final no embarque"
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
              disabled={isSubmitting}
            />
            <BaseDialog.Action
              label="Confirmar Pagamento"
              variant="primary"
              onClick={form.handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
