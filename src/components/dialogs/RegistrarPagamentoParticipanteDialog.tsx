import { useEffect, useMemo } from "react";
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
  useRegistrarPagamentoParticipanteForm,
  type RegistrarPagamentoParticipanteFormData,
} from "@/hooks/form/useRegistrarPagamentoParticipanteForm";
import { useAtualizarStatusParticipanteMutation } from "@/hooks/api/useFretamentosApi";
import type { FretamentoParticipante, TipoPagamento } from "@/services/api/fretamento.api";
import { formatCurrency, toLocalDateString } from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { DollarSign, Calendar, CreditCard, Wand2 } from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RegistrarPagamentoParticipanteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fretamentoId: string;
  passeioTitulo?: string;
  participante: FretamentoParticipante | null;
  onSuccess?: () => void;
}

export function RegistrarPagamentoParticipanteDialog({
  isOpen,
  onClose,
  fretamentoId,
  passeioTitulo,
  participante,
  onSuccess,
}: RegistrarPagamentoParticipanteDialogProps) {
  const mutation = useAtualizarStatusParticipanteMutation();

  const valorTotal = participante ? Number(participante.valor || 0) : 0;
  const valorJaPago = participante ? Number(participante.valor_pago || 0) : 0;
  const saldoRestante = Math.max(0, valorTotal - valorJaPago);

  const form = useRegistrarPagamentoParticipanteForm({ saldoRestante });
  const valorInput = form.watch("valor");

  useEffect(() => {
    if (isOpen && participante) {
      form.reset({
        valor: saldoRestante > 0 ? moneyMask(saldoRestante) : moneyMask(valorTotal),
        tipo_pagamento: (participante.tipo_pagamento as "PIX" | "dinheiro" | "cartao-credito" | "cartao-debito" | "transferencia" | "boleto") || "PIX",
        data_pagamento: toLocalDateString(new Date()),
      });
    }
  }, [isOpen, participante, saldoRestante, valorTotal, form]);

  const handleFillMock = () => {
    const valorMock = saldoRestante > 0 ? (saldoRestante / 2).toFixed(2) : "40.00";
    form.setValue("valor", moneyMask(Number(valorMock)), { shouldValidate: true });
    form.setValue("tipo_pagamento", "PIX", { shouldValidate: true });
    form.setValue("data_pagamento", toLocalDateString(new Date()), { shouldValidate: true });
  };

  const previewSimulacao = useMemo(() => {
    const valorAdicional = moneyToNumber(valorInput || "0");
    const novoTotalPago = valorJaPago + valorAdicional;
    const novoSaldo = Math.max(0, valorTotal - novoTotalPago);
    const vaiQuitar = novoTotalPago >= valorTotal && valorTotal > 0;
    const vaiSerParcial = novoTotalPago > 0 && novoTotalPago < valorTotal;

    return {
      valorAdicional,
      novoTotalPago,
      novoSaldo,
      vaiQuitar,
      vaiSerParcial,
    };
  }, [valorInput, valorJaPago, valorTotal]);

  if (!participante) return null;

  const onSubmit = async (values: RegistrarPagamentoParticipanteFormData) => {
    try {
      const valorAdicional = moneyToNumber(values.valor);
      if (valorAdicional <= 0) {
        toast.error("Informe um valor maior que zero.");
        return;
      }

      const novoTotalPago = valorJaPago + valorAdicional;
      const novoStatus = novoTotalPago >= valorTotal ? "pago" : "parcial";

      await mutation.mutateAsync({
        fretamentoId,
        participanteId: participante.id,
        payload: {
          valor_pago: novoTotalPago,
          status_pagamento: novoStatus,
          tipo_pagamento: values.tipo_pagamento as TipoPagamento,
          data_pagamento: values.data_pagamento,
        },
      });

      toast.success(
        novoStatus === "pago"
          ? `Pagamento integral de ${participante.nome} registrado!`
          : `Sinal de ${formatCurrency(valorAdicional)} registrado para ${participante.nome}!`
      );
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao registrar pagamento do participante.");
    }
  };

  const isSubmitting = mutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="md">
      <BaseDialog.Header
        title="Registrar Pagamento"
        subtitle={`Participante: ${participante.nome}${passeioTitulo ? ` • ${passeioTitulo}` : ""}`}
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
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">{formatCurrency(valorTotal)}</span>
        </div>
        <div>
          <span className="text-[#737373] block text-[10px] sm:text-[11px] font-medium">Já Pago</span>
          <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm truncate block mt-0.5">{formatCurrency(valorJaPago)}</span>
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
                <div className="space-y-1.5">
                  <MoneyInput
                    field={field}
                    label="Valor a Dar Baixa Agora"
                    required
                    labelClassName="text-[#0a0a0a] font-medium text-xs"
                    inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                  />
                  {saldoRestante > 0 && field.value !== moneyMask(saldoRestante) && (
                    <button
                      type="button"
                      onClick={() => field.onChange(moneyMask(saldoRestante))}
                      className="text-[11px] font-medium text-[#0a0a0a] hover:underline ml-1 cursor-pointer"
                    >
                      Preencher com saldo total ({formatCurrency(saldoRestante)})
                    </button>
                  )}
                </div>
              )}
            />

            <div className="p-3 rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] text-xs space-y-1">
              <span className="text-[11px] text-[#737373] block font-medium">Previsão após este registro:</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[#0a0a0a] font-medium">
                  {previewSimulacao.vaiQuitar
                    ? "Inscrição Quitada"
                    : previewSimulacao.vaiSerParcial
                      ? "Pagamento Parcial (Sinal)"
                      : "Sem alterações"}
                </span>
                <span className="text-[#0a0a0a] font-semibold">
                  A Receber: {formatCurrency(previewSimulacao.novoSaldo)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                        <option value="transferencia">Transferência</option>
                        <option value="cartao-credito">Cartão Crédito</option>
                        <option value="cartao-debito">Cartão Débito</option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Data do Pagamento <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                      <Input
                        type="date"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
                        {...field}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
              disabled={isSubmitting}
            />
            <BaseDialog.Action
              label={previewSimulacao.vaiQuitar ? "Confirmar e Quitar" : "Registrar Sinal"}
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
