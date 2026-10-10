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
import { NativeSelect } from "@/components/ui/native-select";
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
import { CobrancaStatus, ModoCobrancaEnum } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog, useCobrancasByPassageiro } from "@/hooks";
import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useMotoristaFinanceiroUi } from "@/hooks/ui/useMotoristaFinanceiroUi";
import { PassageiroModoCobrancaField } from "@/components/features/passageiro/form/PassageiroModoCobrancaField";

const passageiroFinanceiroSchema = z
  .object({
    isento: z.boolean().default(false),
    valor_cobranca: z.union([z.number(), z.string()]).optional(),
    dia_vencimento: z.string().optional(),
    mes_inicio_cobranca: z.string().optional(),
    ano_inicio_cobranca: z.string().optional(),
    mes_fim_cobranca: z.string().optional(),
    ano_fim_cobranca: z.string().optional(),
    modo_cobranca: z.string().optional(),
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
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { modoCobranca, cobrancaAtiva } = useMotoristaFinanceiroUi();

  const now = getNowBR();
  const currentYear = now.getFullYear();
  const defaultAnoLetivo = passageiro?.ano_letivo ? passageiro.ano_letivo.toString() : getDefaultAnoLetivo();
  const currentMonthStr = useMemo(() => (getNowBR().getMonth() + 1).toString(), []);
  const responsavelFieldsRef = useRef<HTMLDivElement>(null);

  const descricaoResponsavel = useMemo(() => {
    if (cobrancaAtiva) {
      return "Necessário para o envio automático das cobranças no WhatsApp.";
    }
    if (modoCobranca === ModoCobrancaEnum.LEMBRETES) {
      return "Necessário para o envio de avisos de vencimento no WhatsApp.";
    }
    return "Contato do responsável para comunicação rápida.";
  }, [cobrancaAtiva, modoCobranca]);

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
      modo_cobranca: "",
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
        modo_cobranca: passageiro.modo_cobranca || "",
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
      modo_cobranca: data.modo_cobranca ? (data.modo_cobranca as ModoCobrancaEnum) : null,
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
        icon={<DollarSign className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isento"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5">
                  <div className="space-y-0.5 pr-4">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer">
                      Aluno Isento
                    </FormLabel>
                    <div className="text-[11px] sm:text-xs text-[#737373] font-normal leading-relaxed">
                      Ative para filhos, parentes ou cortesias. Nenhuma parcela será gerada.
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
                          Dia do Vencimento <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value || ""}
                            onChange={field.onChange}
                            icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
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

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="mes_inicio_cobranca"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Início <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  form.trigger("mes_fim_cobranca");
                                }}
                                icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                                error={!!fieldState.error}
                              >
                                <option value="" disabled hidden>Selecionar</option>
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
                              Ano <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || (anoInicioOptions[0] || "")}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  field.onChange(val);
                                  form.setValue("ano_fim_cobranca", val);
                                  if (parseInt(val, 10) > currentYear) {
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
                              Término <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  form.trigger("mes_fim_cobranca");
                                }}
                                icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                                error={!!fieldState.error}
                              >
                                <option value="" disabled hidden>Selecionar</option>
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
                              Ano <span className="text-[#e7000b]">*</span>
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

                {isRetroativo && (
                  <Banner
                    variant="warning"
                    description={COBRANCA_BANNER_MESSAGES.RETROATIVA}
                    className="mt-2 w-full"
                  />
                )}

                <PassageiroModoCobrancaField control={form.control} />

                <FormField
                  control={form.control}
                  name="cadastrar_responsavel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer">
                          Cadastrar Responsável
                        </FormLabel>
                        <div className="text-[11px] sm:text-xs text-[#737373] font-normal leading-relaxed">
                          {descricaoResponsavel}
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
                          className="data-[state=checked]:bg-primary"
                          aria-label="Cadastrar responsável para cobranças automáticas"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("cadastrar_responsavel") && (
                  <div
                    ref={responsavelFieldsRef}
                    className="space-y-3 animate-in fade-in duration-200"
                  >
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Nome do Responsável <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                {...field}
                                placeholder="Nome completo"
                                className={cn(
                                  "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none",
                                  fieldState.error && "border-[#e7000b]"
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
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            WhatsApp do Responsável <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                placeholder="(11) 99999-9999"
                                type="tel"
                                className={cn(
                                  "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none font-medium",
                                  fieldState.error && "border-[#e7000b]"
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
