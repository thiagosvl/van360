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
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { dateMask } from "@/utils/masks";
import { CalendarDays, CreditCard, Info } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface PassageiroFormFinanceiroProps {
  editingPassageiro: Passageiro | null;
  isExternal?: boolean;
}

export function PassageiroFormFinanceiro({
  editingPassageiro,
  isExternal = false,
}: PassageiroFormFinanceiroProps) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        Mensalidade
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor_cobranca"
            render={({ field }) => (
              <MoneyInput
                field={field}
                label="Valor"
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
                  Dia do Vencimento <span className={cn("text-red-600", isExternal && "hidden")}>*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5",
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
                  Início do Transporte <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    {...field}
                    onChange={(e) => {
                      field.onChange(dateMask(e.target.value));
                    }}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
