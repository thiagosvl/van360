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
        {isLoadingPassageiro ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#737373] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a0a0a]" />
            <p className="text-xs">Carregando dados do aluno...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-5"
            >
              {needsResponsavelGroup && (
                <div className="space-y-3.5">
                  <div className="pb-1.5 border-b border-[#e5e5e5]">
                    <h3 className="text-xs font-semibold text-[#0a0a0a] tracking-tight">
                      Responsável Financeiro
                    </h3>
                  </div>

                  {needsNomeResp && (
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                            Nome do Responsável <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                {...field}
                                placeholder="Nome completo do responsável"
                                className={cn(
                                  "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors",
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

                  {(needsTelefoneResp || needsCpfResp) && (
                    <div className={cn("grid gap-3", needsTelefoneResp && needsCpfResp ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                      {needsTelefoneResp && (
                        <FormField
                          control={form.control}
                          name="telefone_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-[#0a0a0a]">
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
                                      "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors",
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
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-[#0a0a0a]">
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
                                      "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-colors",
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
                    </div>
                  )}

                  {needsParentesco && (
                    <FormField
                      control={form.control}
                      name="parentesco_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                            Parentesco <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || ""}
                              onChange={field.onChange}
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
              )}

              {needsFinanceiroGroup && (
                <div className="space-y-3.5">
                  <div className="pb-1.5 border-b border-[#e5e5e5]">
                    <h3 className="text-xs font-semibold text-[#0a0a0a] tracking-tight">
                      Valores e Vencimento
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {needsValor && (
                      <FormField
                        control={form.control}
                        name="valor_cobranca"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Valor da Parcela"
                            required
                            labelClassName="text-xs font-medium text-[#0a0a0a]"
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
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#0a0a0a]">
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
                <div className="space-y-3.5">
                  <div className="pb-1.5 border-b border-[#e5e5e5]">
                    <h3 className="text-xs font-semibold text-[#0a0a0a] tracking-tight">
                      Período do Transporte
                    </h3>
                  </div>

                  {needsPeriodo && (
                    <FormField
                      control={form.control}
                      name="periodo"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#0a0a0a]">
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

                  {(needsDataInicio || needsDataFim) && (
                    <div className={cn("grid gap-3", needsDataInicio && needsDataFim ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                      {needsDataInicio && (
                        <FormField
                          control={form.control}
                          name="data_inicio_transporte"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-[#0a0a0a]">
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
                                          "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-[#f5f5f5] justify-start focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] transition-colors",
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
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-[#0a0a0a]">
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
                                          "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-[#f5f5f5] justify-start focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] transition-colors",
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
                  )}
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
          disabled={isLoadingPassageiro}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
