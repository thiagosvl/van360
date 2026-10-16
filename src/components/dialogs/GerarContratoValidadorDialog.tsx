import { BaseDialog } from "@/components/ui/BaseDialog";
import { isDevEnv } from "@/utils/detectPlatform";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/forms";
import { NativeSelect } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  X,
  Hash,
  CalendarIcon,
  Wand2,
  User,
  Phone,
  CalendarDays,
  Clock,
  Contact,
  DollarSign,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseLocalDate } from "@/utils/dateUtils";
import { useGerarContratoValidadorViewModel } from "@/hooks/ui/useGerarContratoValidadorViewModel";
import { cpfMask, phoneMask } from "@/utils/masks";
import { Passageiro } from "@/types/passageiro";
import { formatFirstName } from "@/utils/formatters";
import { parentescos } from "@/utils/formatters/passenger";
import { periodos } from "@/utils/formatters/periodo";
import { safeCloseDialog } from "@/hooks";

interface GerarContratoValidadorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string | null;
  initialPassageiro?: Passageiro;
  onSuccess?: (
    passageiroId: string,
    bypassed?: boolean,
    updatedValues?: { valorMensal?: number; diaVencimento?: number },
    updatedPassageiro?: Passageiro
  ) => void;
}

export function GerarContratoValidadorDialog({
  isOpen,
  onClose,
  passageiroId,
  initialPassageiro,
  onSuccess,
}: GerarContratoValidadorDialogProps) {
  const {
    form,
    passageiro,
    isLoadingPassageiro,
    isSubmitting,
    handleSubmit,
    openCalendarInicio,
    setOpenCalendarInicio,
    openCalendarFim,
    setOpenCalendarFim,
    handleFillMock,
    onFormError,
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
    needsParentesco,
    needsResponsavelGroup,
    needsValor,
    needsVencimento,
    needsFinanceiroGroup,
    needsDataInicio,
    needsDataFim,
    needsPeriodo,
    needsTransporteGroup,
  } = useGerarContratoValidadorViewModel({
    isOpen,
    onClose,
    passageiroId,
    initialPassageiro,
    onSuccess,
  });

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const firstName = passageiro?.nome ? formatFirstName(passageiro.nome) : "o aluno";

  const hasNoPendencias = !needsResponsavelGroup && !needsFinanceiroGroup && !needsTransporteGroup;

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Dados do Contrato"
        subtitle={`Informações para emitir o contrato de ${firstName}`}
        onClose={handleClose}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[18px] h-9 w-9 border border-[#e5e5e5] transition-colors"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body className="p-5 sm:p-6 bg-white overflow-y-auto">
        {isLoadingPassageiro || hasNoPendencias ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#737373] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a0a0a]" />
            <p className="text-xs">
              {isLoadingPassageiro ? "Carregando dados do aluno..." : "Validando dados do contrato..."}
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-6 sm:space-y-8 pb-2"
            >
              {needsResponsavelGroup && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-4">
                    <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                      <Contact className="w-4 h-4" />
                    </div>
                    Responsável Financeiro
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {needsNomeResp && (
                      <FormField
                        control={form.control}
                        name="nome_responsavel"
                        render={({ field, fieldState }) => (
                          <FormItem className={cn("space-y-1.5", (!needsTelefoneResp && !needsCpfResp && !needsParentesco) ? "col-span-1 sm:col-span-2" : "col-span-1")}>
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Nome do Responsável <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  {...field}
                                  placeholder="Nome completo do responsável"
                                  className={cn(
                                    "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors shadow-none",
                                    fieldState.error && "border-[#e7000b] focus:border-[#e7000b]"
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {needsTelefoneResp && (
                      <FormField
                        control={form.control}
                        name="telefone_responsavel"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1 space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              WhatsApp <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                  placeholder="(11) 99999-9999"
                                  type="tel"
                                  className={cn(
                                    "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors shadow-none",
                                    fieldState.error && "border-[#e7000b] focus:border-[#e7000b]"
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {needsCpfResp && (
                      <FormField
                        control={form.control}
                        name="cpf_responsavel"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1 space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              CPF do Responsável <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  {...field}
                                  inputMode="numeric"
                                  placeholder="000.000.000-00"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(cpfMask(e.target.value))}
                                  className={cn(
                                    "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors shadow-none",
                                    fieldState.error && "border-[#e7000b] focus:border-[#e7000b]"
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {needsParentesco && (
                      <FormField
                        control={form.control}
                        name="parentesco_responsavel"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1 space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Parentesco <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || ""}
                                onChange={field.onChange}
                                error={!!fieldState.error}
                              >
                                <option value="">Selecionar</option>
                                {parentescos.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </NativeSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {needsFinanceiroGroup && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-4">
                    <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    Valores e Vencimento
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {needsValor && (
                      <FormField
                        control={form.control}
                        name="valor_cobranca"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Valor da Parcela"
                            required
                            labelClassName="text-[#0a0a0a] font-medium text-xs"
                            inputClassName="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors"
                          />
                        )}
                      />
                    )}

                    {needsVencimento && (
                      <FormField
                        control={form.control}
                        name="dia_vencimento"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1 space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Dia do Vencimento <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || ""}
                                onChange={field.onChange}
                                icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                                error={!!fieldState.error}
                              >
                                <option value="">Dia</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <option key={day} value={day.toString()}>
                                    Dia {day}
                                  </option>
                                ))}
                              </NativeSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {needsTransporteGroup && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-4">
                    <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    Período do Transporte
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {needsPeriodo && (
                      <FormField
                        control={form.control}
                        name="periodo"
                        render={({ field, fieldState }) => (
                          <FormItem className={cn("space-y-1.5", (!needsDataInicio && !needsDataFim) ? "col-span-1 sm:col-span-2" : "col-span-1")}>
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Turno / Período <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || ""}
                                onChange={field.onChange}
                                icon={<Clock className="h-4 w-4 text-[#737373]" />}
                                error={!!fieldState.error}
                              >
                                <option value="">Selecionar</option>
                                {periodos.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </NativeSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {needsDataInicio && (
                      <FormField
                        control={form.control}
                        name="data_inicio_transporte"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1 space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Início do Transporte <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <Popover open={openCalendarInicio} onOpenChange={setOpenCalendarInicio}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="relative group">
                                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-[#f5f5f5] justify-start focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] transition-colors shadow-none",
                                        !field.value && "text-[#737373]",
                                        fieldState.error && "border-[#e7000b] focus:border-[#e7000b]"
                                      )}
                                    >
                                      {field.value ? field.value : "dd/mm/aaaa"}
                                    </Button>
                                    {field.value && (
                                      <div
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex p-0.5 rounded-full hover:bg-[#e5e5e5] transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          field.onChange("");
                                        }}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3 rounded-[20px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? parseLocalDate(convertDateBrToISO(field.value)) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(formatDateToBR(date));
                                      setOpenCalendarInicio(false);
                                    } else {
                                      field.onChange("");
                                    }
                                  }}
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {needsDataFim && (
                      <FormField
                        control={form.control}
                        name="data_fim_transporte"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1 space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Término do Transporte <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <Popover open={openCalendarFim} onOpenChange={setOpenCalendarFim}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="relative group">
                                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-[#f5f5f5] justify-start focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] transition-colors shadow-none",
                                        !field.value && "text-[#737373]",
                                        fieldState.error && "border-[#e7000b] focus:border-[#e7000b]"
                                      )}
                                    >
                                      {field.value ? field.value : "dd/mm/aaaa"}
                                    </Button>
                                    {field.value && (
                                      <div
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex p-0.5 rounded-full hover:bg-[#e5e5e5] transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          field.onChange("");
                                        }}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3 rounded-[20px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? parseLocalDate(convertDateBrToISO(field.value)) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(formatDateToBR(date));
                                      setOpenCalendarFim(false);
                                    } else {
                                      field.onChange("");
                                    }
                                  }}
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        />
        <BaseDialog.Action
          label="Salvar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isSubmitting}
          disabled={isLoadingPassageiro || hasNoPendencias}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
