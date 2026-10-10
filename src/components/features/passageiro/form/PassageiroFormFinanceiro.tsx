import { MoneyInput } from "@/components/forms";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { CalendarDays, DollarSign, ShieldCheck } from "lucide-react";
import { monthOptions } from "@/utils/dateUtils";
import { Banner } from "@/components/ui/Banner";
import { PassageiroModoCobrancaField } from "./PassageiroModoCobrancaField";
import { useMemo } from "react";
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

  return (
    <div id="section-parcelas" className="space-y-6">
      <div className="flex items-center gap-3 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-6">
        <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] flex-shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
        Parcelas
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="isento"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5 sm:p-4">
              <div className="space-y-0.5 pr-4">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer">
                  Aluno Isento
                </FormLabel>
                <div className="text-[11px] sm:text-xs text-[#737373] font-normal leading-relaxed">
                  Ative para filhos, parentes ou cortesias. Nenhuma cobrança ou parcela será gerada.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-primary"
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
                    labelClassName="text-[#0a0a0a] font-medium text-xs"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="dia_vencimento"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Dia do Vencimento {!isExternal && <span className="text-[#e7000b]">*</span>}
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        icon={<CalendarDays className="h-4 w-4" />}
                        value={field.value || ""}
                        error={!!fieldState.error}
                      >
                        <option value="" disabled hidden>Selecionar</option>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="mes_inicio_cobranca"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Início da Cobrança {!isExternal && <span className="text-[#e7000b]">*</span>}
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            icon={<CalendarDays className="h-4 w-4" />}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              form.trigger("mes_fim_cobranca");
                            }}
                            error={!!fieldState.error}
                          >
                            <option value="" disabled hidden>Mês</option>
                            {monthOptions.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </NativeSelect>
                        </FormControl>
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
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Ano {!isExternal && <span className="text-[#e7000b]">*</span>}
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value || (anoInicioOptions[0] || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val);
                              form.setValue("ano_fim_cobranca", val);
                              if (parseInt(val, 10) > new Date().getFullYear()) {
                                form.setValue("mes_inicio_cobranca", "");
                                form.setValue("mes_fim_cobranca", "");
                              }
                              form.trigger("mes_fim_cobranca");
                            }}
                          >
                            {anoInicioOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </NativeSelect>
                        </FormControl>
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
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Término da Cobrança {!isExternal && <span className="text-[#e7000b]">*</span>}
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            icon={<CalendarDays className="h-4 w-4" />}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              form.trigger("mes_fim_cobranca");
                            }}
                            error={!!fieldState.error}
                          >
                            <option value="" disabled hidden>Mês</option>
                            {monthOptions.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </NativeSelect>
                        </FormControl>
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
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Ano {!isExternal && <span className="text-[#e7000b]">*</span>}
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value || (anoFimOptions[0] || "")}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              form.trigger("mes_fim_cobranca");
                            }}
                          >
                            {anoFimOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </NativeSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {!isExternal && (
              <PassageiroModoCobrancaField control={form.control} />
            )}

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
