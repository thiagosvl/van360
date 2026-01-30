import { MoneyInput } from "@/components/forms";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { CalendarDays, CreditCard } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface PassageiroFormFinanceiroProps {
  editingPassageiro: Passageiro | null;
  validacaoFranquia: {
    podeAtivar: boolean;
    franquiaContratada: number;
    // Add other properties if needed
  };
  onRequestUpgrade: () => void;
}

export function PassageiroFormFinanceiro({
  editingPassageiro,
  validacaoFranquia,
  onRequestUpgrade,
}: PassageiroFormFinanceiroProps) {
  const form = useFormContext();

  return (
    <AccordionItem
      value="cobranca"
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
    >
      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <CreditCard className="w-5 h-5" />
          </div>
          Mensalidade
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor_cobranca"
            render={({ field }) => (
              <MoneyInput
                field={field}
                label="Valor"
                required
                inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
            )}
          />
          <FormField
            control={form.control}
            name="dia_vencimento"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Dia do Vencimento <span className="text-red-600">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
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
                <FormLabel className="text-gray-700 font-medium ml-1">
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
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4">
          <FormField
            control={form.control}
            name="enviar_cobranca_automatica"
            render={({ field }) => {
              return (
                <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="enviar_cobranca_automatica"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        if (checked && !validacaoFranquia.podeAtivar) {
                          onRequestUpgrade();
                          return;
                        }
                        field.onChange(checked);
                      }}
                      disabled={false}
                      className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 mt-0"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex-1">
                    <FormLabel
                      htmlFor="enviar_cobranca_automatica"
                      className="text-base font-medium text-gray-700 cursor-pointer"
                    >
                      Ativar Cobrança Automática
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500">
                      As cobranças serão enviadas automaticamente todo mês para
                      este passageiro.
                    </FormDescription>
                  </div>
                </FormItem>
              );
            }}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
