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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import { useManualPaymentViewModel } from "@/hooks/ui/useManualPaymentViewModel";
import { safeCloseDialog, useAppPreferences } from "@/hooks";
import { cn } from "@/lib/utils";
import { RegistrarPagamentoManualDTO } from "@/types/dtos/cobranca.dto";
import { Cobranca } from "@/types/cobranca";
import { getNowBR, parseLocalDate } from "@/utils/dateUtils";
import { formatFirstName, formatShortName, getStatusColor, getStatusText } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
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
  observacao?: string | null;
  onPaymentRecorded: (updatedCobranca?: Cobranca | Record<string, unknown>, dataSent?: RegistrarPagamentoManualDTO) => void;
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
  observacao,
  onPaymentRecorded,
}: ManualPaymentDialogProps) {
  const { form, openCalendar, setOpenCalendar, handleSubmit, onFormError, isPending } = useManualPaymentViewModel({
    isOpen,
    onClose,
    cobrancaId,
    valorOriginal,
    passageiroNome,
    observacao,
    onPaymentRecorded,
  });

  const { formatoNomeResponsavel } = useAppPreferences();

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <BaseDialog.Header title="Registrar Pagamento" icon={<Wallet className="w-5 h-5" />} onClose={handleClose} />
      <BaseDialog.Body>
        <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#737373]">
              Parcela de {format(parseLocalDate(dataVencimento), "MMMM", { locale: ptBR })}
            </span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium uppercase tracking-wider",
                getStatusColor(status, dataVencimento)
              )}
            >
              {getStatusText(status, dataVencimento)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[#737373]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0a0a0a] leading-tight truncate">
                  {formatShortName(passageiroNome, true)}
                </p>
                {responsavelNome && (
                  <p className="text-xs text-[#737373] font-normal leading-tight truncate mt-0.5">
                    {formatNomeResponsavelExibicao(responsavelNome, formatoNomeResponsavel)}
                  </p>
                )}
              </div>
            </div>

            {valorOriginal > 0 && (
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold text-[#0a0a0a] tabular-nums leading-none">
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
                  labelClassName="text-[#0a0a0a] font-medium text-xs"
                  inputClassName="pl-12 h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] focus:bg-white focus:border-[#0a0a0a] transition-all"
                />
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
                    <PopoverContent align="start" className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl">
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
                      value={field.value || ""}
                      onChange={field.onChange}
                      icon={<CreditCard className="h-5 w-5 text-[#737373]" />}
                      error={!!form.formState.errors.tipo_pagamento}
                    >
                      <option value="">Selecionar</option>
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
                <FormItem
                  className="flex flex-row items-center justify-between rounded-[20px] bg-white border border-[#e5e5e5] p-4 transition-all hover:bg-[#fafafa] cursor-pointer shadow-xs select-none gap-4"
                  onClick={() => field.onChange(!field.value)}
                >
                  <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                    <FormLabel className="text-sm font-semibold text-[#0a0a0a] block cursor-pointer">
                      Enviar Recibo no WhatsApp
                    </FormLabel>
                    <p className="text-xs text-[#737373] leading-relaxed">
                      {field.value
                        ? "O comprovante de pagamento será enviado automaticamente para o WhatsApp do responsável."
                        : "O pagamento será registrado sem enviar comprovante por WhatsApp."}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#e5e5e5] shrink-0"
                      aria-label="Enviar Recibo no WhatsApp"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </FormControl>
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
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={handleClose} disabled={isPending} />
        <BaseDialog.Action label="Registrar" onClick={form.handleSubmit(handleSubmit, onFormError)} isLoading={isPending} />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
