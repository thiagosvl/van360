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
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import { useComplementarPagamentoViewModel } from "@/hooks/ui/useComplementarPagamentoViewModel";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { ComplementarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import { Cobranca } from "@/types/cobranca";
import { getNowBR, parseLocalDate } from "@/utils/dateUtils";
import { formatCurrency, formatFirstName, formatShortName, getMesAbreviado } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CreditCard, User, Wallet } from "lucide-react";

export interface ComplementarPagamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome?: string;
  valorOriginal: number;
  valorJaPago: number;
  dataVencimento: string;
  mes?: number;
  ano?: number;
  observacao?: string | null;
  onPaymentRecorded: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: ComplementarPagamentoManualDTO) => void;
}

export default function ComplementarPagamentoDialog({
  isOpen,
  onClose,
  cobrancaId,
  passageiroNome,
  responsavelNome,
  valorOriginal,
  valorJaPago,
  dataVencimento,
  mes,
  ano,
  observacao,
  onPaymentRecorded,
}: ComplementarPagamentoDialogProps) {
  const {
    form,
    openCalendar,
    setOpenCalendar,
    saldoRestanteAtual,
    valorAdicionalNumerico,
    novoTotalPago,
    handleSubmit,
    onFormError,
    isPending,
  } = useComplementarPagamentoViewModel({
    isOpen,
    onClose,
    cobrancaId,
    valorOriginal,
    valorJaPago,
    passageiroNome,
    observacao,
    onPaymentRecorded,
  });

  const mesExibicao = mes
    ? getMesAbreviado(mes)
    : dataVencimento
      ? format(parseLocalDate(dataVencimento), "MMM", { locale: ptBR })
      : "";
  const anoExibicao = ano
    ? String(ano).slice(-2)
    : dataVencimento
      ? format(parseLocalDate(dataVencimento), "yy")
      : "";

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Complementar Pagamento" icon={<Wallet className="w-5 h-5" />} onClose={() => safeCloseDialog(onClose)} />
      <BaseDialog.Body>
        <div className="bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5] p-3.5 sm:p-4 space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Parcela de {mesExibicao}/{anoExibicao}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-2xs bg-amber-50 text-amber-700 border border-amber-200/60">
              Parcial
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight truncate">
                  {formatShortName(passageiroNome, true)}
                </p>
                {responsavelNome && (
                  <p className="text-[11px] text-muted-foreground font-medium leading-tight truncate mt-0.5">
                    {formatFirstName(responsavelNome)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Falta pagar</p>
              <p className="text-sm font-bold text-amber-600 tabular-nums leading-tight mt-1">
                {formatCurrency(saldoRestanteAtual)}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-4">
            <FormField
              control={form.control}
              name="valor_adicional"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <MoneyInput
                    field={field}
                    label="Valor Pago"
                    required
                    labelClassName="text-[#0a0a0a] font-medium text-xs"
                    inputClassName="pl-12 h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] focus:bg-white focus:border-[#0a0a0a] transition-all"
                  />
                  {valorAdicionalNumerico > 0 && (
                    <p className="text-[11px] text-[#737373] font-medium mt-1">
                      Total acumulado: <span className="font-semibold text-[#0a0a0a]">{formatCurrency(novoTotalPago)}</span>
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Data do Pagamento <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="relative">
                          <CalendarIcon className="absolute left-4 top-3 h-5 w-5 text-[#737373] z-10" />
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full pl-12 h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-white text-sm text-[#0a0a0a] justify-start",
                              !field.value && "text-[#737373]"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span className="text-[#737373]">Selecionar</span>
                            )}
                          </Button>
                        </div>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 rounded-[18px] border-[#e5e5e5] shadow-lg">
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Forma de Pagamento <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      {...field}
                      icon={<CreditCard className="h-5 w-5" />}
                      value={field.value || ""}
                      error={!!form.formState.errors.tipo_pagamento}
                    >
                      <option value="" disabled hidden>Selecionar</option>
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enviar_recibo_whatsapp_manual"
              render={({ field }) => (
                <FormItem className="flex flex-col p-3.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] space-y-0">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-4 w-4 rounded-md border-[#e5e5e5] data-[state=checked]:bg-[#0a0a0a] data-[state=checked]:border-[#0a0a0a]"
                      />
                    </FormControl>
                    <div className="flex-1 space-y-1 leading-none">
                      <FormLabel className="flex-1 cursor-pointer font-medium text-xs sm:text-sm text-[#0a0a0a] m-0">
                        Enviar Recibo Atualizado no WhatsApp
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage className="pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Observação <span className="text-xs text-[#737373] font-normal">(apenas para você)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="min-h-[72px] rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] resize-none focus:bg-white focus:border-[#0a0a0a] transition-all"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={() => safeCloseDialog(onClose)} disabled={isPending} />
        <BaseDialog.Action
          label="Registrar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
