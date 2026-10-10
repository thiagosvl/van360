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
import { NativeSelect } from "@/components/ui/native-select";
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
        icon={<DollarSign className="h-5 w-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ffffff] transition-all"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Total</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">{formatCurrency(Number(fretamento.valor_total || 0))}</span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Recebido</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">{formatCurrency(Number(fretamento.total_pago || 0))}</span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Restante</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">{formatCurrency(saldoRestante)}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-4 p-5 sm:p-6 overflow-y-auto bg-[#ffffff]">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Valor Recebido"
                  required
                  labelClassName="text-[#0a0a0a] font-medium text-xs"
                  inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                />
              )}
            />

            <FormField
              control={form.control}
              name="tipo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Forma de Pagamento <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      icon={<CreditCard className="h-4 w-4 text-[#737373]" />}
                    >
                      <option value="PIX">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao-credito">Cartão de Crédito</option>
                      <option value="cartao-debito">Cartão de Débito</option>
                      <option value="transferencia">Transferência Bancária</option>
                      <option value="boleto">Boleto</option>
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Data do Recebimento <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                      <Input
                        type="date"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
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
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">Descrição / Observação</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                      <Input
                        placeholder="Ex: Quitação final no embarque"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
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
