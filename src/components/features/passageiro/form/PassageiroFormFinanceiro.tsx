import { MoneyInput } from "@/components/forms";
import {
  FormControl,
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { CalendarDays, DollarSign, ShieldCheck } from "lucide-react";
import { monthOptions } from "@/utils/dateUtils";
import { Banner } from "@/components/ui/Banner";
import { useEffect, useMemo } from "react";
import {
  getAnoCobrancaFimOptions,
  getAnoCobrancaInicioOptions,
  isCobrancaRetroativa,
  COBRANCA_BANNER_MESSAGES,
} from "@/utils/domain";

interface PassageiroFormFinanceiroProps {
  editingPassageiro: Passageiro | null;
  isExternal?: boolean;
}

export function PassageiroFormFinanceiro({
  editingPassageiro,
  isExternal = false,
}: PassageiroFormFinanceiroProps) {
  const form = useFormContext();
  const isIsento = form.watch("isento");
  const mesInicio = form.watch("mes_inicio_cobranca");
  const mesFim = form.watch("mes_fim_cobranca");
  const anoInicio = form.watch("ano_inicio_cobranca");
  const anoFim = form.watch("ano_fim_cobranca");
  const anoLetivo = form.watch("ano_letivo");

  const anoInicioOptions = getAnoCobrancaInicioOptions(anoLetivo || anoInicio);
  const anoFimOptions = getAnoCobrancaFimOptions(anoInicio);

  const isRetroativo = useMemo(() => isCobrancaRetroativa(mesInicio, anoInicio), [mesInicio, anoInicio]);

  useEffect(() => {
    if (form.formState.errors.mes_fim_cobranca) {
      form.trigger("mes_fim_cobranca");
    }
  }, [mesInicio, anoInicio, mesFim, anoFim, form]);

  return (
    <div id="section-parcelas" className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        Parcelas
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="isento"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-4 shadow-sm">
              <div className="space-y-0.5 pr-4">
                <FormLabel className="text-slate-800 font-bold text-sm cursor-pointer">
                  Aluno Isento
                </FormLabel>
                <div className="text-xs text-slate-500 font-normal leading-relaxed">
                  Ative para filhos, parentes ou cortesias. Nenhuma cobrança ou parcela será gerada.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[#1a3a5c]"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isIsento && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="mes_inicio_cobranca"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Início da Cobrança {!isExternal && <span className="text-red-600">*</span>}
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            form.trigger("mes_fim_cobranca");
                          }}
                          value={field.value || undefined}
                        >
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
                                <SelectValue placeholder="Mês" />
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
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="ano_inicio_cobranca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Ano {!isExternal && <span className="text-red-600">*</span>}
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            form.setValue("ano_fim_cobranca", val);
                            if (parseInt(val, 10) > new Date().getFullYear()) {
                              form.setValue("mes_inicio_cobranca", "");
                              form.setValue("mes_fim_cobranca", "");
                            }
                            form.trigger("mes_fim_cobranca");
                          }}
                          value={field.value || (anoInicioOptions[0] || "")}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {anoInicioOptions.map((y) => (
                              <SelectItem key={y} value={y}>
                                {y}
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

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="mes_fim_cobranca"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Término da Cobrança {!isExternal && <span className="text-red-600">*</span>}
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            form.trigger("mes_fim_cobranca");
                          }}
                          value={field.value || undefined}
                        >
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
                                <SelectValue placeholder="Mês" />
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
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="ano_fim_cobranca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Ano {!isExternal && <span className="text-red-600">*</span>}
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            form.trigger("mes_fim_cobranca");
                          }}
                          value={field.value || (anoFimOptions[0] || "")}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {anoFimOptions.map((y) => (
                              <SelectItem key={y} value={y}>
                                {y}
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

            <Banner
              variant={isRetroativo ? "warning" : "info"}
              description={
                isRetroativo
                  ? COBRANCA_BANNER_MESSAGES.RETROATIVA
                  : COBRANCA_BANNER_MESSAGES.PADRAO
              }
              className="mt-3 w-full"
            />
          </>
        )}
      </div>
    </div>
  );
}
