import { MoneyInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import { useManualPaymentViewModel } from "@/hooks/ui/useManualPaymentViewModel";
import { cn } from "@/lib/utils";
import { getNowBR, parseLocalDate } from "@/utils/dateUtils";
import { formatFirstName, formatShortName, getStatusColor, getStatusText } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CreditCard, User, Wallet } from "lucide-react";

export interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome: string;
  valorOriginal: number;
  status: string;
  dataVencimento: string;
  onPaymentRecorded: (updatedCobranca?: any) => void;
}

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
  const { form, openCalendar, setOpenCalendar, handleSubmit, onFormError, isPending } = useManualPaymentViewModel({
    isOpen,
    onClose,
    cobrancaId,
    valorOriginal,
    onPaymentRecorded,
  });

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Registrar Pagamento" icon={<Wallet className="w-5 h-5" />} onClose={onClose} />
      <BaseDialog.Body>
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/60 p-3.5 space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Parcela de {format(parseLocalDate(dataVencimento), "MMMM", { locale: ptBR })}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-2xs",
                getStatusColor(status, dataVencimento)
              )}
            >
              {getStatusText(status, dataVencimento)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1a3a5c] leading-tight truncate">
                  {formatShortName(passageiroNome, true)}
                </p>
                {responsavelNome && (
                  <p className="text-[11px] text-slate-500 font-medium leading-tight truncate mt-0.5">
                    {formatFirstName(responsavelNome)}
                  </p>
                )}
              </div>
            </div>

            {valorOriginal > 0 && (
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-[#1a3a5c] tabular-nums leading-none">
                  {valorOriginal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-4">
            <FormField
              control={form.control}
              name="valor_pago"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Valor Pago"
                  required
                  labelClassName="text-slate-700 font-semibold ml-1"
                  inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 transition-all"
                />
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-700 font-semibold ml-1">
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
                              "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left font-normal hover:bg-gray-100 text-md justify-start",
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
                        disabled={(date) => date > getNowBR()}
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
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Forma de Pagamento <span className="text-red-600">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                        <SelectTrigger
                          className={cn(
                            "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left",
                            form.formState.errors.tipo_pagamento && "border-red-500"
                          )}
                          aria-invalid={!!form.formState.errors.tipo_pagamento}
                        >
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            {method.icon}
                            <span>{method.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={isPending} />
        <BaseDialog.Action label="Registrar" onClick={form.handleSubmit(handleSubmit, onFormError)} isLoading={isPending} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
