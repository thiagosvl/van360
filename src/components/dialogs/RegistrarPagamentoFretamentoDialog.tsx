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
import { formatCurrency, toLocalDateString } from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { DollarSign, Calendar, FileText, CreditCard, Wand2 } from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { Button } from "@/components/ui/button";
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
        data_pagamento: toLocalDateString(new Date()),
        descricao: "",
      });
    }
  }, [isOpen, fretamento, saldoRestante, form]);

  const handleFillMock = () => {
    const valorMock = saldoRestante > 0 ? (saldoRestante > 200 ? 200 : saldoRestante).toFixed(2) : "150.00";
    form.setValue("valor", moneyMask(Number(valorMock)), { shouldValidate: true });
    form.setValue("tipo_pagamento", "PIX", { shouldValidate: true });
    form.setValue("data_pagamento", toLocalDateString(new Date()), { shouldValidate: true });
    form.setValue("descricao", "Pagamento de parcela via PIX", { shouldValidate: true });
  };

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
        icon={<DollarSign className="h-5 w-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 transition-all active:scale-95 shadow-2xs"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <div className="mx-5 sm:mx-6 mt-3.5 p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-500 block text-[11px] font-medium">Total do Frete</span>
          <span className="font-bold text-slate-800 text-sm">{formatCurrency(Number(fretamento.valor_total || 0))}</span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block text-[11px] font-medium">Já Recebido</span>
          <span className="font-bold text-emerald-700 text-sm">{formatCurrency(Number(fretamento.total_pago || 0))}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[11px] font-medium">Saldo Restante</span>
          <span className="font-bold text-slate-900 text-sm">{formatCurrency(saldoRestante)}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-3.5 p-5 sm:p-6 overflow-y-auto">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Valor Recebido"
                  required
                  labelClassName="text-slate-700 font-semibold ml-0.5 text-xs"
                  inputClassName="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm font-bold text-slate-800 transition-all"
                />
              )}
            />

            <FormField
              control={form.control}
              name="tipo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                    Forma de Pagamento <span className="text-red-600">*</span>
                  </FormLabel>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm text-left">
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
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                    Data do Recebimento <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Input
                        type="date"
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Descrição / Observação</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Input
                        placeholder="Ex: Quitação final no embarque"
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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
