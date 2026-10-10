import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useMultaJurosForm, MultaJurosFormData } from "@/hooks/form/useMultaJurosForm";
import { ContractMultaTipo } from "@/types/enums";
import { moneyMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { Loader2, Save } from "lucide-react";
import React, { useEffect } from "react";

export const MultaJurosConfigForm = React.memo(function MultaJurosConfigForm() {
  const { financeiro, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();

  const form = useMultaJurosForm({
    cobrar_multa_atraso: Boolean(financeiro?.cobrar_multa_atraso),
    multa_atraso_tipo: (financeiro?.multa_atraso_tipo as ContractMultaTipo) || ContractMultaTipo.PERCENTUAL,
    multa_atraso_valor: financeiro?.multa_atraso_valor !== null && financeiro?.multa_atraso_valor !== undefined ? Number(financeiro.multa_atraso_valor) : null,
    cobrar_juros_atraso: Boolean(financeiro?.cobrar_juros_atraso),
    juros_atraso_tipo: (financeiro?.juros_atraso_tipo as ContractMultaTipo) || ContractMultaTipo.PERCENTUAL,
    juros_atraso_valor: financeiro?.juros_atraso_valor !== null && financeiro?.juros_atraso_valor !== undefined ? Number(financeiro.juros_atraso_valor) : null,
    dias_carencia_atraso: financeiro?.dias_carencia_atraso !== null && financeiro?.dias_carencia_atraso !== undefined ? Number(financeiro.dias_carencia_atraso) : 0,
  });

  useEffect(() => {
    if (financeiro) {
      form.reset({
        cobrar_multa_atraso: Boolean(financeiro.cobrar_multa_atraso),
        multa_atraso_tipo: (financeiro.multa_atraso_tipo as ContractMultaTipo) || ContractMultaTipo.PERCENTUAL,
        multa_atraso_valor: financeiro.multa_atraso_valor !== null && financeiro.multa_atraso_valor !== undefined ? Number(financeiro.multa_atraso_valor) : null,
        cobrar_juros_atraso: Boolean(financeiro.cobrar_juros_atraso),
        juros_atraso_tipo: (financeiro.juros_atraso_tipo as ContractMultaTipo) || ContractMultaTipo.PERCENTUAL,
        juros_atraso_valor: financeiro.juros_atraso_valor !== null && financeiro.juros_atraso_valor !== undefined ? Number(financeiro.juros_atraso_valor) : null,
        dias_carencia_atraso: financeiro.dias_carencia_atraso !== null && financeiro.dias_carencia_atraso !== undefined ? Number(financeiro.dias_carencia_atraso) : 0,
      });
    }
  }, [financeiro, form]);

  const cobrarMulta = form.watch("cobrar_multa_atraso");
  const tipoMulta = form.watch("multa_atraso_tipo");
  const cobrarJuros = form.watch("cobrar_juros_atraso");
  const tipoJuros = form.watch("juros_atraso_tipo");

  const handleSubmit = async (values: MultaJurosFormData) => {
    try {
      await updateFinanceiro({
        ...values,
        dias_carencia_atraso: 0,
        dias_validade_apos_vencimento: 30,
      });
      toast.success("Configurações de multa e juros salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações de multa e juros.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Banner
          variant="info"
          description="Quando configurados, o aplicativo do banco do pagador calcula multa e juros automaticamente ao ler o QR Code após o vencimento. 100% dos encargos recebidos são repassados diretamente para você."
        />

        <div className="bg-[#fafafa] rounded-[18px] p-4 sm:p-5 border border-[#e5e5e5] space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-[#0a0a0a] block">
                Multa por Atraso
              </span>
              <span className="text-xs text-[#737373] block leading-relaxed">
                Aplicada uma única vez caso o pagamento ocorra após o vencimento.
              </span>
            </div>
            <FormField
              control={form.control}
              name="cobrar_multa_atraso"
              render={({ field }) => (
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isUpdating}
                  />
                </FormControl>
              )}
            />
          </div>

          {cobrarMulta && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#e5e5e5]">
              <FormField
                control={form.control}
                name="multa_atraso_tipo"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      Formato da Multa
                    </FormLabel>
                    <FormControl>
                      <div className="inline-flex p-1 bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] w-full">
                        <button
                          type="button"
                          onClick={() => field.onChange(ContractMultaTipo.PERCENTUAL)}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-[14px] transition-all text-center ${
                            field.value === ContractMultaTipo.PERCENTUAL
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-[#737373] hover:text-[#0a0a0a]"
                          }`}
                        >
                          Percentual (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(ContractMultaTipo.FIXO)}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-[14px] transition-all text-center ${
                            field.value === ContractMultaTipo.FIXO
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-[#737373] hover:text-[#0a0a0a]"
                          }`}
                        >
                          Valor Fixo (R$)
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="multa_atraso_valor"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      {tipoMulta === ContractMultaTipo.PERCENTUAL ? "Percentual de Multa" : "Valor da Multa"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={tipoMulta === ContractMultaTipo.PERCENTUAL ? "number" : "text"}
                          step={tipoMulta === ContractMultaTipo.PERCENTUAL ? "0.1" : undefined}
                          disabled={isUpdating}
                          placeholder={tipoMulta === ContractMultaTipo.PERCENTUAL ? "0%" : "0,00"}
                          value={
                            field.value !== null && field.value !== undefined
                              ? tipoMulta === ContractMultaTipo.PERCENTUAL
                                ? field.value
                                : moneyMask(field.value)
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              field.onChange(null);
                              return;
                            }
                            if (tipoMulta === ContractMultaTipo.PERCENTUAL) {
                              field.onChange(Number(val));
                            } else {
                              const rawDigits = val.replace(/\D/g, "");
                              field.onChange(rawDigits ? Number(rawDigits) / 100 : null);
                            }
                          }}
                          className="h-11 rounded-[18px] bg-white border-[#e5e5e5] focus:border-[#0a0a0a] text-sm font-medium pr-8 text-[#0a0a0a]"
                        />
                        {tipoMulta === ContractMultaTipo.PERCENTUAL && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#737373]">
                            %
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="bg-[#fafafa] rounded-[18px] p-4 sm:p-5 border border-[#e5e5e5] space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-[#0a0a0a] block">
                Juros de Mora (por Atraso)
              </span>
              <span className="text-xs text-[#737373] block leading-relaxed">
                Incidem diariamente durante o período em que a parcela permanecer em aberto.
              </span>
            </div>
            <FormField
              control={form.control}
              name="cobrar_juros_atraso"
              render={({ field }) => (
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isUpdating}
                  />
                </FormControl>
              )}
            />
          </div>

          {cobrarJuros && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#e5e5e5]">
              <FormField
                control={form.control}
                name="juros_atraso_tipo"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      Formato dos Juros
                    </FormLabel>
                    <FormControl>
                      <div className="inline-flex p-1 bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] w-full">
                        <button
                          type="button"
                          onClick={() => field.onChange(ContractMultaTipo.PERCENTUAL)}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-[14px] transition-all text-center ${
                            field.value === ContractMultaTipo.PERCENTUAL
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-[#737373] hover:text-[#0a0a0a]"
                          }`}
                        >
                          % ao mês
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(ContractMultaTipo.FIXO)}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-[14px] transition-all text-center ${
                            field.value === ContractMultaTipo.FIXO
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-[#737373] hover:text-[#0a0a0a]"
                          }`}
                        >
                          R$ ao dia
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="juros_atraso_valor"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      {tipoJuros === ContractMultaTipo.PERCENTUAL ? "Taxa Mensal" : "Valor Diário"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={tipoJuros === ContractMultaTipo.PERCENTUAL ? "number" : "text"}
                          step={tipoJuros === ContractMultaTipo.PERCENTUAL ? "0.1" : undefined}
                          disabled={isUpdating}
                          placeholder={tipoJuros === ContractMultaTipo.PERCENTUAL ? "0%" : "0,00"}
                          value={
                            field.value !== null && field.value !== undefined
                              ? tipoJuros === ContractMultaTipo.PERCENTUAL
                                ? field.value
                                : moneyMask(field.value)
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              field.onChange(null);
                              return;
                            }
                            if (tipoJuros === ContractMultaTipo.PERCENTUAL) {
                              field.onChange(Number(val));
                            } else {
                              const rawDigits = val.replace(/\D/g, "");
                              field.onChange(rawDigits ? Number(rawDigits) / 100 : null);
                            }
                          }}
                          className="h-11 rounded-[18px] bg-white border-[#e5e5e5] focus:border-[#0a0a0a] text-sm font-medium pr-16 text-[#0a0a0a]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#737373]">
                          {tipoJuros === ContractMultaTipo.PERCENTUAL ? "% a.m." : "/ dia"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#e5e5e5]">
          <button
            type="submit"
            disabled={isUpdating}
            className="h-11 px-6 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-[18px] hover:bg-primary-hover transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Encargos
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  );
});
