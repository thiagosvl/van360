import { MoneyInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { seForPago } from "@/utils/domain/cobranca/disableActions";
import {
  checkCobrancaJaVenceu,
  formatDate,
  formatDateToBR,
  getStatusColor,
  getStatusText,
  parseCurrencyToNumber,
  tiposPagamento,
  toLocalDateString,
} from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { endOfMonth, format, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BadgeCheck, CalendarIcon, Loader2, User, XCircle } from "lucide-react";
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

  const cobrancaMesAnoDate = new Date(cobranca.data_vencimento + "T00:00:00");

  const shouldDisableValueDate = isPaga && !isPagamentoManual;

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
        className="max-w-md max-h-[95vh] overflow-y-auto bg-white"
      >
        <DialogHeader>
          <DialogTitle>Edição de Cobrança</DialogTitle>
        </DialogHeader>

        <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Passageiro</span>
          </div>
          <p className="font-semibold">
            {cobranca.passageiros.nome}{" "}({cobranca.passageiros.nome_responsavel})
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {(() => {
              if (seForPago(cobranca)) {
                return <BadgeCheck className="w-4 h-4" />;
              } else if (checkCobrancaJaVenceu(cobranca.data_vencimento)) {
                return <XCircle className="w-4 h-4" />;
              } else {
                return <CalendarIcon className="w-4 h-4" />;
              }
            })()}

            <span>Status</span>
          </div>
          <p className="font-semibold">
            <span
              className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${getStatusColor(
                cobranca.status,
                cobranca.data_vencimento
              )}`}
            >
              {cobranca.status === PASSAGEIRO_COBRANCA_STATUS_PAGO
                ? `Paga em ${formatDateToBR(cobranca.data_pagamento)}`
                : getStatusText(cobranca.status, cobranca.data_vencimento)}
            </span>
          </p>
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
                />
              )}
            />

            <Controller
              control={form.control}
              name="data_vencimento"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Data do Vencimento <span className="text-red-600">*</span>
                  </FormLabel>
                  <Popover
                    open={openCalendarDataVencimento}
                    onOpenChange={setOpenCalendarDataVencimento}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            fieldState.error && "border-red-500 ring-red-500"
                          )}
                          disabled={shouldDisableDueDateField}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span className="text-black">Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Forma de pagamento <span className="text-red-600">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
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
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Pagamento</FormLabel>
                    <Popover
                      open={openCalendarDataPagamento}
                      onOpenChange={setOpenCalendarDataPagamento}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
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
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || form.formState.isSubmitting}
                className="flex-1"
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
      </DialogContent>
    </Dialog>
  );
}
