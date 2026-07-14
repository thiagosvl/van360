import { MoneyInput } from "@/components/forms";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { BadgeDollarSign, CalendarDays, CalendarIcon, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseLocalDate, getStartOfDayBR, monthOptions } from "@/utils/dateUtils";

interface PassageiroFormFinanceiroProps {
  editingPassageiro: Passageiro | null;
  isExternal?: boolean;
}

export function PassageiroFormFinanceiro({
  isExternal = false,
}: PassageiroFormFinanceiroProps) {
  const form = useFormContext();
  const [openCalendarInicio, setOpenCalendarInicio] = useState(false);
  const [openCalendarFim, setOpenCalendarFim] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
          <BadgeDollarSign className="w-5 h-5" />
        </div>
        Parcelas
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="valor_cobranca"
            render={({ field }) => (
              <MoneyInput
                field={field}
                label="Valor da Parcela"
                required={!isExternal}
                labelClassName="text-slate-700 font-semibold ml-1"
                inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5"
              />
            )}
          />
          <FormField
            control={form.control}
            name="dia_vencimento"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Dia do Vencimento {!isExternal && <span className="text-red-600">*</span>}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                          fieldState.error && "border-red-500",
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione o dia" />
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

          <FormField
            control={form.control}
            name="data_inicio_transporte"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Início do Transporte
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
                  Término do Transporte
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="mes_inicio_cobranca"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Mês Início Cobrança {!isExternal && <span className="text-red-600">*</span>}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                          fieldState.error && "border-red-500",
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mes_fim_cobranca"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Mês Término Cobrança {!isExternal && <span className="text-red-600">*</span>}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                          fieldState.error && "border-red-500",
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
