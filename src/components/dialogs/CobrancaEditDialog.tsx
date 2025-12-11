import { MoneyInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { useUpdateCobranca } from "@/hooks";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { seForPago, seOrigemAutomatica } from "@/utils/domain/cobranca/disableActions";
import {
  formatDate,
  getStatusColor,
  getStatusText,
  parseCurrencyToNumber,
  tiposPagamento,
  toLocalDateString
} from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { endOfMonth, format, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CreditCard, Loader2, Pencil, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface CobrancaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobranca: Cobranca;
  onCobrancaUpdated: () => void;
}

const cobrancaEditSchema = z
  .object({
    valor: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => parseCurrencyToNumber(val) > 0, {
        message: "O valor deve ser maior que 0",
      }),
    data_vencimento: z.date({
      required_error: "A data de vencimento é obrigatória.",
    }),
    data_pagamento: z
      .date()
      .optional()
      .refine((date) => !date || date <= new Date(), {
        message: "A data não pode ser futura.",
      }),
    tipo_pagamento: z.string().optional(),
    is_paga: z.boolean(),
    cobranca_mes_ano: z.date(),
    cobranca_data_original_str: z.string(),
  })
  .refine(
    (data) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataVencimentoFormString = format(
        data.data_vencimento,
        "yyyy-MM-dd"
      );

      const dataFoiAlterada =
        dataVencimentoFormString !== data.cobranca_data_original_str;

      if (data.is_paga) return true;

      return true;
    },
    {
      message:
        "O novo vencimento deve ser igual ou posterior à data de hoje (exigência do provedor de pagamento).",
      path: ["data_vencimento"],
    }
  );
type CobrancaEditFormData = z.infer<typeof cobrancaEditSchema>;

export default function CobrancaEditDialog({
  isOpen,
  onClose,
  cobranca,
  onCobrancaUpdated,
}: CobrancaEditDialogProps) {
  const [openCalendarDataVencimento, setOpenCalendarDataVencimento] =
    useState(false);
  const [openCalendarDataPagamento, setOpenCalendarDataPagamento] =
    useState(false);

  const updateCobranca = useUpdateCobranca();
  const loading = updateCobranca.isPending;

  const isPaga = seForPago(cobranca);
  const isPagamentoManual = cobranca.pagamento_manual;

  const cobrancaMesAnoDate = new Date(cobranca.data_vencimento);

  const shouldDisableValueDate = (seForPago(cobranca) && !isPagamentoManual) || seOrigemAutomatica(cobranca);

  const shouldDisableDueDateField = isPaga;

  const shouldShowTipoPagamentoEdit = isPaga && isPagamentoManual;

  const local_moneyToNumber = moneyToNumber;
  const local_onCobrancaUpdated = onCobrancaUpdated;

  const form = useForm<CobrancaEditFormData>({
    resolver: zodResolver(cobrancaEditSchema),
    defaultValues: {
      valor: "",
      data_vencimento: cobrancaMesAnoDate,
      data_pagamento: cobranca?.data_pagamento
        ? new Date(cobranca.data_pagamento + "T00:00:00")
        : undefined,
      tipo_pagamento: isPaga ? cobranca.tipo_pagamento || "" : undefined,
      is_paga: isPaga,
      cobranca_mes_ano: cobrancaMesAnoDate,
      cobranca_data_original_str: cobranca.data_vencimento,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (isOpen && cobranca?.id) {
      const valorEmCentavos = Math.round(Number(cobranca.valor) * 100);

      form.reset({
        valor: moneyMask(String(valorEmCentavos)),
        data_vencimento: formatDate(cobranca.data_vencimento),
        data_pagamento: cobranca?.data_pagamento
          ? new Date(cobranca.data_pagamento + "T00:00:00")
          : undefined,
        tipo_pagamento: cobranca.tipo_pagamento || "",
        is_paga: isPaga,
        cobranca_mes_ano: cobrancaMesAnoDate,
        cobranca_data_original_str: cobranca.data_vencimento,
      });
      form.clearErrors();
      form.setValue("is_paga", isPaga);
    }
  }, [isOpen, cobranca?.id]);

  const handleSubmit = async (data: CobrancaEditFormData) => {
    const valorAlterado =
      local_moneyToNumber(data.valor) !== Number(cobranca.valor);

    const vencimentoAlterado =
      data.data_vencimento !== null &&
      format(data.data_vencimento, "yyyy-MM-dd") !== cobranca.data_vencimento;

    const dataPagamentoAlterado =
      data.data_pagamento &&
      format(data.data_pagamento, "yyyy-MM-dd") !== cobranca.data_pagamento;

    const tipoPagamentoAlterado =
      (data.tipo_pagamento || "") !== (cobranca.tipo_pagamento || "");

    const houveAlteracao =
      valorAlterado ||
      vencimentoAlterado ||
      tipoPagamentoAlterado ||
      dataPagamentoAlterado;

    if (!houveAlteracao) {
      toast.info("cobranca.info.nenhumaAlteracao");
      onClose();
      return;
    }

    const updatePayload: any = {
      valor: local_moneyToNumber(data.valor),
      data_vencimento: toLocalDateString(data.data_vencimento),
      tipo_pagamento: shouldShowTipoPagamentoEdit
        ? data.tipo_pagamento
        : undefined,
    };

    if (cobranca.pagamento_manual && data.data_pagamento) {
      updatePayload.data_pagamento = toLocalDateString(data.data_pagamento);
    }

    updateCobranca.mutate(
      {
        id: cobranca.id,
        data: updatePayload,
        cobrancaOriginal: cobranca,
      },
      {
        onSuccess: () => {
          local_onCobrancaUpdated();
          onClose();
        },
      }
    );
  };

  const disableCalendarDate = (date: Date) => {
    if (!isSameMonth(date, cobrancaMesAnoDate)) {
      return true;
    }

    if (!isPaga) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      return false;
    }

    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[90vw] sm:w-full max-w-md max-h-[95vh] gap-0 flex flex-col overflow-hidden bg-blue-600 rounded-3xl border-0 shadow-2xl p-0"
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
          <DialogDescription className="text-blue-100/80 text-sm mt-1">
             Atualize os dados da cobrança.
          </DialogDescription>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                  Referência
                </p>
                <p className="text-lg font-bold text-gray-900 capitalize leading-tight">
                  {format(new Date(cobranca.data_vencimento), "MMMM", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm",
                  getStatusColor(cobranca.status, cobranca.data_vencimento)
                )}
              >
                {cobranca.status === PASSAGEIRO_COBRANCA_STATUS_PAGO
                  ? "PAGO"
                  : getStatusText(cobranca.status, cobranca.data_vencimento)}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {cobranca.passageiros.nome}
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                  {cobranca.passageiros.nome_responsavel}
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <Controller
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    required
                    disabled={shouldDisableValueDate}
                    inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    label="Valor da Cobrança"
                  />
                )}
              />

              <Controller
                control={form.control}
                name="data_vencimento"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Data do Vencimento <span className="text-red-600">*</span>
                    </FormLabel>
                    <Popover
                      open={openCalendarDataVencimento}
                      onOpenChange={(open) => {
                        if (!shouldDisableDueDateField) {
                          setOpenCalendarDataVencimento(open);
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className="relative">
                            <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left font-normal hover:bg-gray-100 justify-start",
                                !field.value && "text-muted-foreground",
                                fieldState.error && "border-red-500 ring-red-500"
                              )}
                              disabled={shouldDisableDueDateField}
                              aria-invalid={!!fieldState.error}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span className="text-gray-500">Selecione a data</span>
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              setOpenCalendarDataVencimento(false);
                            }
                          }}
                          defaultMonth={cobrancaMesAnoDate}
                          fromMonth={startOfMonth(cobrancaMesAnoDate)}
                          toMonth={endOfMonth(cobrancaMesAnoDate)}
                          disabled={disableCalendarDate}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {shouldShowTipoPagamentoEdit && (
                <FormField
                  control={form.control}
                  name="tipo_pagamento"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium ml-1">
                        Forma de pagamento <span className="text-red-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                            <SelectTrigger 
                              className={cn(
                                "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                fieldState.error && "border-red-500"
                              )}
                              aria-invalid={!!fieldState.error}
                            >
                              <SelectValue placeholder="Selecione a forma" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {tiposPagamento.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {cobranca?.pagamento_manual && (
                <FormField
                  control={form.control}
                  name="data_pagamento"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-700 font-medium ml-1">Data do Pagamento <span className="text-red-600">*</span></FormLabel>
                      <Popover
                        open={openCalendarDataPagamento}
                        onOpenChange={setOpenCalendarDataPagamento}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left font-normal hover:bg-gray-100 justify-start",
                                  !field.value && "text-muted-foreground"
                                )}
                                aria-invalid={!!fieldState.error}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span className="text-gray-500">Selecione a data</span>
                                )}
                              </Button>
                            </div>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) field.onChange(date);
                              setOpenCalendarDataPagamento(false);
                            }}
                            disabled={(date) => date > new Date()}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || form.formState.isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  {loading || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
