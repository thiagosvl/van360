import { MoneyInput } from "@/components/forms";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { currentMonthInText } from "@/utils/formatters";
import { AlertTriangle, CalendarDays, CreditCard } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface PassageiroFormFinanceiroProps {
  editingPassageiro: Passageiro | null;
  validacaoFranquia: {
    podeAtivar: boolean;
    franquiaContratada: number;
    // Add other properties if needed
  };
}

export function PassageiroFormFinanceiro({
  editingPassageiro,
  validacaoFranquia,
}: PassageiroFormFinanceiroProps) {
  const form = useFormContext();
  const { openLimiteFranquiaDialog } = useLayout();

  const diaVencimento = form.watch("dia_vencimento");
  const emitirCobranca = form.watch("emitir_cobranca_mes_atual");

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
          Cobrança
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
                          fieldState.error && "border-red-500"
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
                          // Wraps in setTimeout to avoid flushSync error with Radix Checkbox
                          setTimeout(() => {
                            if (validacaoFranquia.franquiaContratada === 0) {
                              openLimiteFranquiaDialog({
                                targetPassengerId: editingPassageiro?.id,
                                title: "Cobrança Automática",
                                description:
                                  "A Cobrança Automática envia as faturas e lembretes sozinha. Automatize sua rotina com o Plano Completo.",
                                hideLimitInfo: true,
                                onUpgradeSuccess: () => {
                                  setTimeout(() => {
                                    form.setValue(
                                      "enviar_cobranca_automatica",
                                      true
                                    );
                                  }, 100);
                                },
                              });
                            } else {
                              openLimiteFranquiaDialog({
                                targetPassengerId: editingPassageiro?.id,
                                onUpgradeSuccess: () => {
                                  setTimeout(() => {
                                    form.setValue(
                                      "enviar_cobranca_automatica",
                                      true
                                    );
                                  }, 100);
                                },
                              });
                            }
                          }, 100);
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
        {!editingPassageiro && (
          <div className="mt-4">
            <FormField
              control={form.control}
              name="emitir_cobranca_mes_atual"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="emitir_cobranca_mes_atual"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 mt-0"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex-1">
                    <FormLabel
                      htmlFor="emitir_cobranca_mes_atual"
                      className="text-base font-medium text-gray-700 cursor-pointer"
                    >
                      Registrar cobrança de {currentMonthInText()}?
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500">
                      Se desmarcado, a primeira cobrança será gerada apenas no
                      próximo mês.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {(() => {
              const diaInformado = Number(diaVencimento) || null;

              if (
                !editingPassageiro &&
                emitirCobranca &&
                diaInformado &&
                Number(diaInformado) < new Date().getDate()
              ) {
                return (
                  <div className="mt-4">
                    <Alert
                      variant="destructive"
                      className="bg-yellow-50 border-yellow-200 text-yellow-900 [&>svg]:text-yellow-900"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="font-bold">
                        Ajuste na Data de Vencimento
                      </AlertTitle>
                      <AlertDescription className="text-yellow-800">
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                          <li>
                            Como o dia <strong>{diaInformado}</strong> já
                            passou, a primeira cobrança{" "}
                            <strong>vencerá hoje</strong>.
                          </li>
                          <li>
                            As próximas cobranças vencerão normalmente no{" "}
                            <strong>dia {diaInformado}</strong> de cada mês.
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
