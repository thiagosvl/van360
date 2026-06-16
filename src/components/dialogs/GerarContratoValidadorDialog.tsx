import { BaseDialog } from "@/components/ui/BaseDialog";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Info, Loader2, X, Hash, CalendarIcon, FileCheck, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseLocalDate, getStartOfDayBR } from "@/utils/dateUtils";
import { useGerarContratoValidadorViewModel, GerarContratoValidadorDialogProps } from "@/hooks/ui/useGerarContratoValidadorViewModel";

import { cpfMask } from "@/utils/masks";

export function GerarContratoValidadorDialog({
  isOpen,
  onClose,
  passageiroId,
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
  } = useGerarContratoValidadorViewModel({
    isOpen,
    onClose,
    passageiroId,
    onSuccess,
  });

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Completar Cadastro"
        icon={<FileCheck className="w-5 h-5" />}
        onClose={onClose}
        leftAction={import.meta.env.DEV && (
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
            <p className="text-sm">Carregando dados do passageiro...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-6 pb-2 px-1 pt-2"
            >
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4 shadow-sm">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100/50 text-amber-600 shrink-0 border border-amber-200/50">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-amber-900 leading-relaxed font-medium">
                    Para gerar um contrato válido, precisamos de algumas informações essenciais que estão faltando no cadastro de <strong>{passageiro?.nome?.split(' ')[0]}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                          <Hash className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            onChange={(e) => {
                              field.onChange(cpfMask(e.target.value));
                            }}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full pl-12 pr-10 h-12 rounded-xl bg-slate-50 border-slate-200 text-left font-normal hover:bg-slate-100 justify-start focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  !field.value && "text-muted-foreground",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                {field.value ? field.value : "dd/mm/aaaa"}
                              </Button>
                              {field.value && (
                                <div
                                  className="absolute right-3 top-3.5 text-gray-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-5 w-5" />
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
                              <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full pl-12 pr-10 h-12 rounded-xl bg-slate-50 border-slate-200 text-left font-normal hover:bg-slate-100 justify-start focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  !field.value && "text-muted-foreground",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                {field.value ? field.value : "dd/mm/aaaa"}
                              </Button>
                              {field.value && (
                                <div
                                  className="absolute right-3 top-3.5 text-gray-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-5 w-5" />
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
                            disabled={(date) => date < getStartOfDayBR()}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={onClose}
          disabled={isSubmitting || isLoadingPassageiro}
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
