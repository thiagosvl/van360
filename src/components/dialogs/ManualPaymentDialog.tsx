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
import { useRegistrarPagamentoManual } from "@/hooks";
import { cn } from "@/lib/utils";
import {
    getStatusColor,
    getStatusText,
    parseCurrencyToNumber,
    toLocalDateString
} from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CreditCard, Loader2, User, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome: string;
  valorOriginal: number;
  status: string;
  dataVencimento: string;
  onPaymentRecorded: () => void;
}

const paymentSchema = z.object({
  valor_pago: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => parseCurrencyToNumber(val) > 0, {
      message: "O valor deve ser maior que 0",
    }),
  data_pagamento: z.date({
    required_error: "A data de pagamento é obrigatória.",
  }),
  tipo_pagamento: z.string().min(1, "A forma de pagamento é obrigatória."),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function ManualPaymentDialog({
  isOpen,
  onClose,
  cobrancaId,
  passageiroNome,
  responsavelNome,
  valorOriginal,
  status,
  dataVencimento,
  onPaymentRecorded,
}: ManualPaymentDialogProps) {
  const registrarPagamento = useRegistrarPagamentoManual();
  const [openCalendar, setOpenCalendar] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      valor_pago: "",
      data_pagamento: new Date(),
      tipo_pagamento: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const valorEmCentavos = Math.round(Number(valorOriginal) * 100);
      form.reset({
        valor_pago: moneyMask(String(valorEmCentavos)),
        data_pagamento: new Date(),
        tipo_pagamento: "",
      });
    }
  }, [isOpen, valorOriginal, form]);

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

  const handleSubmit = async (data: PaymentFormData) => {
    const pagamentoData = {
      valor_pago: moneyToNumber(data.valor_pago),
      data_pagamento: toLocalDateString(data.data_pagamento),
      tipo_pagamento: data.tipo_pagamento,
    };

    registrarPagamento.mutate(
      { cobrancaId, data: pagamentoData },
      {
        onSuccess: () => {
          onPaymentRecorded();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[90vw] sm:w-full max-w-md max-h-[95vh] gap-0 flex flex-col overflow-hidden bg-white rounded-3xl border-0 shadow-2xl p-0"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Registrar Pagamento
          </DialogTitle>
          <DialogDescription className="text-blue-100/80 text-sm mt-1">
             Informe o valor e a data do pagamento.
          </DialogDescription>
        </div>

        <div className="p-4 sm:p-6 pt-2 flex-1 overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                  Referência
                </p>
                <p className="text-lg font-bold text-gray-900 capitalize leading-tight">
                  {format(new Date(dataVencimento), "MMMM", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm",
                  getStatusColor(status, dataVencimento)
                )}
              >
                {status === PASSAGEIRO_COBRANCA_STATUS_PAGO
                  ? "PAGO"
                  : getStatusText(status, dataVencimento)}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {passageiroNome}
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                  {responsavelNome}
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="valor_pago"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    label="Valor Pago"
                    required
                    inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Data do Pagamento <span className="text-red-600">*</span>
                    </FormLabel>
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
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
                              setOpenCalendar(false);
                            }
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

              <FormField
                control={form.control}
                name="tipo_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Forma de Pagamento <span className="text-red-600">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                          <SelectTrigger
                            className={cn(
                              "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left",
                              form.formState.errors.tipo_pagamento &&
                                "border-red-500"
                            )}
                            aria-invalid={!!form.formState.errors.tipo_pagamento}
                          >
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="cartao-credito">
                          Cartão de Crédito
                        </SelectItem>
                        <SelectItem value="cartao-debito">
                          Cartão de Débito
                        </SelectItem>
                        <SelectItem value="transferencia">
                          Transferência
                        </SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={registrarPagamento.isPending}
                  className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={registrarPagamento.isPending}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  {registrarPagamento.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Registrando...
                    </>
                  ) : (
                    "Registrar Pagamento"
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
