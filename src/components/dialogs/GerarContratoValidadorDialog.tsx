import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  X,
  Hash,
  CalendarIcon,
  Wand2,
  FileText,
  User,
  Phone,
  DollarSign,
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
    updatedValues?: { valorMensal?: number; diaVencimento?: number }
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
    isChecking,
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
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

  if (isOpen && (isChecking || isLoadingPassageiro) && !passageiro) {
    return (
      <BaseDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        description="Verificando dados para o contrato..."
        maxWidth="sm"
      >
        <BaseDialog.Header
          title="Validando contrato"
          onClose={handleClose}
        />
        <BaseDialog.Body>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a3a5c]" />
            <p className="text-xs text-slate-500 font-medium">Carregando informações...</p>
          </div>
        </BaseDialog.Body>
      </BaseDialog>
    );
  }

  if (isChecking && isOpen) {
    return null;
  }

  const firstName = passageiro?.nome ? formatFirstName(passageiro.nome) : "o aluno";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      maxWidth="md"
      lockClose
    >
      <BaseDialog.Header
        title="Dados do Contrato"
        icon={<FileText className="w-5 h-5 opacity-80" />}
        onClose={handleClose}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm border border-slate-100"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        {isLoadingPassageiro ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm">Carregando dados do aluno...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-5 pb-2 px-1 pt-1"
            >
              <Banner
                variant="info"
                title="Informações essenciais para emissão"
                description={`Preencha os dados abaixo para gerar o contrato de ${firstName}.`}
              />

              {needsResponsavelGroup && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                    <User className="w-4 h-4 text-[#1a3a5c]" />
                    <span className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wider">
                      Responsável Financeiro
                    </span>
                  </div>

                  {needsNomeResp && (
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Nome do Responsável <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                              <Input
                                {...field}
                                placeholder="Nome completo do responsável"
                                className={cn(
                                  "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {needsTelefoneResp && (
                      <FormField
                        control={form.control}
                        name="telefone_responsavel"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-semibold ml-1">
                              WhatsApp <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                  placeholder="(11) 99999-9999"
                                  type="tel"
                                  className={cn(
                                    "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                    fieldState.error && "border-red-500"
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
                            <FormLabel className="text-slate-700 font-semibold ml-1">
                              CPF do Responsável <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                <Input
                                  {...field}
                                  inputMode="numeric"
                                  placeholder="000.000.000-00"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(cpfMask(e.target.value))}
                                  className={cn(
                                    "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                    fieldState.error && "border-red-500"
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

                  <FormField
                    control={form.control}
                    name="parentesco_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Parentesco
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm">
                              <SelectValue placeholder="Selecione o parentesco" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {parentescos.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {needsFinanceiroGroup && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                    <DollarSign className="w-4 h-4 text-[#1a3a5c]" />
                    <span className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wider">
                      Valores das Parcelas
                    </span>
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
                            labelClassName="text-slate-700 font-semibold ml-1"
                            inputClassName="pl-12 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5"
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
                            <FormLabel className="text-slate-700 font-semibold ml-1">
                              Dia do Vencimento <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <div className="relative">
                                  <CalendarDays className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                  <SelectTrigger
                                    className={cn(
                                      "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                      fieldState.error && "border-red-500"
                                    )}
                                  >
                                    <SelectValue placeholder="Dia" />
                                  </SelectTrigger>
                                </div>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    Dia {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {needsTransporteGroup && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                    <CalendarDays className="w-4 h-4 text-[#1a3a5c]" />
                    <span className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wider">
                      Período do Transporte
                    </span>
                  </div>

                  {needsPeriodo && (
                    <FormField
                      control={form.control}
                      name="periodo"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Turno / Período <span className="text-red-600">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                <SelectTrigger
                                  className={cn(
                                    "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                    fieldState.error && "border-red-500"
                                  )}
                                >
                                  <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                              </div>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {periodos.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="data_inicio_transporte"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Início do Transporte <span className="text-red-600">*</span>
                          </FormLabel>
                          <Popover open={openCalendarInicio} onOpenChange={setOpenCalendarInicio}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <div className="relative group">
                                  <CalendarIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-10 pr-10 h-11 rounded-xl bg-white border-slate-200 text-left font-normal hover:bg-slate-50 justify-start focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                      !field.value && "text-muted-foreground",
                                      fieldState.error && "border-red-500"
                                    )}
                                  >
                                    {field.value ? field.value : "dd/mm/aaaa"}
                                  </Button>
                                  {field.value && (
                                    <div
                                      className="absolute right-3 top-3 text-gray-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        field.onChange("");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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

                    <FormField
                      control={form.control}
                      name="data_fim_transporte"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Término do Transporte <span className="text-red-600">*</span>
                          </FormLabel>
                          <Popover open={openCalendarFim} onOpenChange={setOpenCalendarFim}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <div className="relative group">
                                  <CalendarIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-10 pr-10 h-11 rounded-xl bg-white border-slate-200 text-left font-normal hover:bg-slate-50 justify-start focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                      !field.value && "text-muted-foreground",
                                      fieldState.error && "border-red-500"
                                    )}
                                  >
                                    {field.value ? field.value : "dd/mm/aaaa"}
                                  </Button>
                                  {field.value && (
                                    <div
                                      className="absolute right-3 top-3 text-gray-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        field.onChange("");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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
          label="Gerar Contrato"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isSubmitting}
          disabled={isLoadingPassageiro}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
