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
          <span className="text-slate-500 block text-[11px] font-medium">Valor Total</span>
          <span className="font-bold text-slate-800 text-sm">{formatCurrency(valorTotal)}</span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block text-[11px] font-medium">Já Recebido</span>
          <span className="font-bold text-slate-800 text-sm">{formatCurrency(valorJaPago)}</span>
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
                <div className="space-y-1.5">
                  <MoneyInput
                    field={field}
                    label="Valor a Dar Baixa Agora"
                    required
                    labelClassName="text-slate-700 font-semibold ml-0.5 text-xs"
                    inputClassName="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm font-bold text-slate-800 transition-all"
                  />
                  {saldoRestante > 0 && field.value !== moneyMask(saldoRestante) && (
                    <button
                      type="button"
                      onClick={() => field.onChange(moneyMask(saldoRestante))}
                      className="text-[11px] font-semibold text-[#1a3a5c] hover:underline ml-1 cursor-pointer"
                    >
                      Preencher com saldo total ({formatCurrency(saldoRestante)})
                    </button>
                  )}
                </div>
              )}
            />

            <div className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 text-xs space-y-1">
              <span className="text-[11px] text-slate-500 block">Previsão após este registro:</span>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-700">
                  {previewSimulacao.vaiQuitar
                    ? "Inscrição Quitada Integralmente"
                    : previewSimulacao.vaiSerParcial
                    ? "Pagamento Parcial (Sinal)"
                    : "Sem alterações"}
                </span>
                <span className="text-slate-900">
                  Restante: {formatCurrency(previewSimulacao.novoSaldo)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="cartao-credito">Cartão Crédito</SelectItem>
                          <SelectItem value="cartao-debito">Cartão Débito</SelectItem>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                      Data do Pagamento <span className="text-red-600">*</span>
                    </FormLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Input
                        type="date"
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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
