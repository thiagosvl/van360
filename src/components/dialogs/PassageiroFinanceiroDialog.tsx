import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { MoneyInput } from "@/components/forms";
import { Input } from "@/components/ui/input";
import {
  Form,
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
import { CalendarDays, DollarSign, Phone, User } from "lucide-react";
import { monthOptions, getNowBR } from "@/utils/dateUtils";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phoneMask, moneyMask } from "@/utils/masks";
import { parseCurrencyToNumber } from "@/utils/formatters";
import {
  getAnoCobrancaFimOptions,
  getAnoCobrancaInicioOptions,
  isCobrancaRetroativa,
  COBRANCA_BANNER_MESSAGES,
  getDefaultAnoLetivo,
} from "@/utils/domain";
import { shouldGeneratePassengerProjection } from "@/utils/domain/cobrancaProjection";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { useCobrancasByPassageiro } from "@/hooks/api/useCobrancasByPassageiro";
import { useLayout } from "@/contexts/LayoutContext";
import { CobrancaStatus } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/hooks";

const passageiroFinanceiroSchema = z
  .object({
    isento: z.boolean().default(false),
    valor_cobranca: z.union([z.number(), z.string()]).optional(),
    dia_vencimento: z.string().optional(),
    mes_inicio_cobranca: z.string().optional(),
    ano_inicio_cobranca: z.string().optional(),
    mes_fim_cobranca: z.string().optional(),
    ano_fim_cobranca: z.string().optional(),
    cadastrar_responsavel: z.boolean().default(false),
    nome_responsavel: z.string().optional(),
    telefone_responsavel: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isento) {
      const valNum = parseCurrencyToNumber(data.valor_cobranca);
      if (!data.valor_cobranca || valNum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o valor da parcela",
          path: ["valor_cobranca"],
        });
      }
      if (!data.dia_vencimento || data.dia_vencimento.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o dia do vencimento",
          path: ["dia_vencimento"],
        });
      }
      if (!data.mes_inicio_cobranca || data.mes_inicio_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o mês de início",
          path: ["mes_inicio_cobranca"],
        });
      }
      if (!data.mes_fim_cobranca || data.mes_fim_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o mês de término",
          path: ["mes_fim_cobranca"],
        });
      }
      if (data.cadastrar_responsavel) {
        if (!data.nome_responsavel || data.nome_responsavel.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o nome do responsável",
            path: ["nome_responsavel"],
          });
        }
        const digits = data.telefone_responsavel ? data.telefone_responsavel.replace(/\D/g, "") : "";
        if (digits.length < 10 || digits.length > 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe um WhatsApp válido com DDD",
            path: ["telefone_responsavel"],
          });
        }
      }
    }
  });

type PassageiroFinanceiroFormData = z.infer<typeof passageiroFinanceiroSchema>;

const getMonthFromDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";
  return parseInt(parts[1], 10).toString();
};

const getYearFromDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 1) return "";
  return parts[0];
};

export interface PassageiroFinanceiroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro | Partial<Passageiro> | null;
  onSuccess?: () => void;
}

export function PassageiroFinanceiroDialog({
  isOpen,
  onClose,
  passageiro,
  onSuccess,
}: PassageiroFinanceiroDialogProps) {
  const updatePassageiro = useUpdatePassageiro();
  const { openFirstChargeDialog } = useLayout();

  const now = getNowBR();
  const currentYear = now.getFullYear();
  const defaultAnoLetivo = passageiro?.ano_letivo ? passageiro.ano_letivo.toString() : getDefaultAnoLetivo();
  const currentMonthStr = useMemo(() => (getNowBR().getMonth() + 1).toString(), []);
  const responsavelFieldsRef = useRef<HTMLDivElement>(null);

  const { data: cobrancasData } = useCobrancasByPassageiro(passageiro?.id, currentYear.toString(), {
    enabled: isOpen && Boolean(passageiro?.id),
  });

  const form = useForm<PassageiroFinanceiroFormData>({
    resolver: zodResolver(passageiroFinanceiroSchema),
    defaultValues: {
      isento: false,
      valor_cobranca: "",
      dia_vencimento: "",
      mes_inicio_cobranca: "2",
      ano_inicio_cobranca: defaultAnoLetivo,
      mes_fim_cobranca: "12",
      ano_fim_cobranca: defaultAnoLetivo,
      cadastrar_responsavel: false,
      nome_responsavel: "",
      telefone_responsavel: "",
    },
  });

  useEffect(() => {
    if (isOpen && passageiro) {
      const inicioMes = getMonthFromDate(passageiro.data_inicio_cobranca);
      const inicioAno = getYearFromDate(passageiro.data_inicio_cobranca);
      const fimMes = getMonthFromDate(passageiro.data_fim_cobranca);
      const fimAno = getYearFromDate(passageiro.data_fim_cobranca);
      const resp = passageiro.responsavel_principal;
      const temTelefoneResp = Boolean(resp?.telefone);

      form.reset({
        isento: !!passageiro.isento,
        valor_cobranca: passageiro.valor_cobranca ? moneyMask(passageiro.valor_cobranca) : "",
        dia_vencimento: passageiro.dia_vencimento ? passageiro.dia_vencimento.toString() : "",
        mes_inicio_cobranca: inicioMes || currentMonthStr,
        ano_inicio_cobranca: inicioAno || defaultAnoLetivo,
        mes_fim_cobranca: fimMes || "12",
        ano_fim_cobranca: fimAno || defaultAnoLetivo,
        cadastrar_responsavel: temTelefoneResp,
        nome_responsavel: resp?.nome || "",
        telefone_responsavel: resp?.telefone ? phoneMask(resp.telefone) : "",
      });
    }
  }, [isOpen, passageiro, defaultAnoLetivo, form, currentMonthStr]);

  const isIsento = form.watch("isento");
  const mesInicio = form.watch("mes_inicio_cobranca");
  const anoInicio = form.watch("ano_inicio_cobranca");

  const anoInicioOptions = getAnoCobrancaInicioOptions(defaultAnoLetivo || anoInicio);
  const anoFimOptions = getAnoCobrancaFimOptions(anoInicio);

  const isRetroativo = useMemo(() => isCobrancaRetroativa(mesInicio, anoInicio), [mesInicio, anoInicio]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const onSubmit = async (data: PassageiroFinanceiroFormData) => {
    if (!passageiro?.id) return;

    const anoIni = data.ano_inicio_cobranca || defaultAnoLetivo;
    const anoTerm = data.ano_fim_cobranca || anoIni;

    const valorFinal = data.isento ? null : (data.valor_cobranca ? parseCurrencyToNumber(data.valor_cobranca) : null);
    const diaFinal = data.isento ? null : (data.dia_vencimento ? Number(data.dia_vencimento) : null);

    const payload: Record<string, unknown> = {
      isento: data.isento,
      valor_cobranca: valorFinal,
      dia_vencimento: diaFinal,
      data_inicio_cobranca: data.isento || !data.mes_inicio_cobranca
        ? null
        : `${anoIni}-${String(data.mes_inicio_cobranca).padStart(2, "0")}-01`,
      data_fim_cobranca: data.isento || !data.mes_fim_cobranca
        ? null
        : `${anoTerm}-${String(data.mes_fim_cobranca).padStart(2, "0")}-01`,
    };

    if (!data.isento && data.cadastrar_responsavel && data.telefone_responsavel) {
      payload.responsavel_principal = {
        nome: data.nome_responsavel?.trim(),
        telefone: data.telefone_responsavel.replace(/\D/g, ""),
      };
    }

    try {
      const response = await updatePassageiro.mutateAsync({
        id: passageiro.id,
        data: payload,
        showToast: false,
      });

      const updatedPassageiro = {
        ...passageiro,
        ...(response && typeof response === "object" ? response : {}),
        ...payload,
        id: passageiro.id,
        valor_cobranca: valorFinal ?? undefined,
        dia_vencimento: diaFinal ?? undefined,
        isento: data.isento,
      } as Passageiro;

      toast.success("Parcelas configuradas com sucesso!");
      handleClose();

      const currentMonth = now.getMonth() + 1;
      const hasCurrentMonthRealCharge = (cobrancasData || []).some(
        (c) => c.mes === currentMonth && c.ano === currentYear && c.status !== CobrancaStatus.CANCELADA
      );

      const isEligibleForFirstCharge = !data.isento && !!valorFinal && valorFinal > 0 && !!diaFinal && shouldGeneratePassengerProjection({
        passageiro: updatedPassageiro,
        targetMonth: currentMonth,
        targetYear: currentYear,
      });

      if (isEligibleForFirstCharge && !hasCurrentMonthRealCharge) {
        openFirstChargeDialog({
          passageiro: updatedPassageiro,
          onSuccess: () => {
            onSuccess?.();
          },
        });
      } else {
        onSuccess?.();
      }
    } catch {
      toast.error("Erro ao salvar as parcelas do aluno.");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title="Ajustar Parcelas"
        icon={<DollarSign className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isento"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 shadow-2xs">
                  <div className="space-y-0.5 pr-4">
                    <FormLabel className="text-slate-800 font-bold text-sm cursor-pointer">
                      Aluno Isento
                    </FormLabel>
                    <div className="text-xs text-slate-500 font-normal leading-relaxed">
                      Ative para filhos, parentes ou cortesias. Nenhuma parcela será gerada.
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="valor_cobranca"
                    render={({ field }) => (
                      <MoneyInput
                        field={field}
                        label="Valor da Parcela"
                        required
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
                          Dia do Vencimento <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <SelectTrigger
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  fieldState.error && "border-red-500"
                                )}
                                aria-invalid={!!fieldState.error}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="mes_inicio_cobranca"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-semibold ml-1">
                              Início <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                form.trigger("mes_fim_cobranca");
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <div className="relative">
                                  <CalendarDays className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                  <SelectTrigger
                                    className={cn(
                                      "pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                      fieldState.error && "border-red-500"
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
                              Ano <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                form.setValue("ano_fim_cobranca", val);
                                if (parseInt(val, 10) > currentYear) {
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
                              Término <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                form.trigger("mes_fim_cobranca");
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <div className="relative">
                                  <CalendarDays className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                  <SelectTrigger
                                    className={cn(
                                      "pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                      fieldState.error && "border-red-500"
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
                              Ano <span className="text-red-600">*</span>
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

                {isRetroativo && (
                  <Banner
                    variant="warning"
                    description={COBRANCA_BANNER_MESSAGES.RETROATIVA}
                    className="mt-2 w-full"
                  />
                )}

                <FormField
                  control={form.control}
                  name="cadastrar_responsavel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 shadow-2xs">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-slate-800 font-bold text-sm cursor-pointer">
                          Cadastrar Responsável
                        </FormLabel>
                        <div className="text-xs text-slate-500 font-normal leading-relaxed">
                          Necessário para o envio automático das cobranças no WhatsApp.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              setTimeout(() => {
                                responsavelFieldsRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "end",
                                });
                              }, 100);
                            }
                          }}
                          aria-label="Cadastrar responsável para cobranças automáticas"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("cadastrar_responsavel") && (
                  <div
                    ref={responsavelFieldsRef}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 animate-in fade-in duration-200"
                  >
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
                                placeholder="Nome completo"
                                className={cn(
                                  "pl-10 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            WhatsApp do Responsável <span className="text-red-600">*</span>
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
                                  "pl-10 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm font-medium",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={updatePassageiro.isPending}
        />
        <BaseDialog.Action
          label="Confirmar"
          onClick={form.handleSubmit(onSubmit)}
          isLoading={updatePassageiro.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
