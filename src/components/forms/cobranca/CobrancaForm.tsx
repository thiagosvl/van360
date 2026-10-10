import { MoneyInput } from "@/components/forms";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { NativeSelect } from "@/components/ui/native-select";
import { CobrancaFormData, useCobrancaForm } from "@/hooks/form/useCobrancaForm";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { calculateSafeDueDate, formatLocalDate, getNowBR, parseLocalDate, monthNamesInBR as mesesConstants } from "@/utils/dateUtils";
import {
    anos,
    tiposPagamento,
} from "@/utils/formatters";
import { endOfMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    AlertTriangle,
    CalendarIcon,
    CreditCard,
    Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

// --- Constants ---
const meses = [
    { value: "1", label: mesesConstants[0] },
    { value: "2", label: mesesConstants[1] },
    { value: "3", label: mesesConstants[2] },
    { value: "4", label: mesesConstants[3] },
    { value: "5", label: mesesConstants[4] },
    { value: "6", label: mesesConstants[5] },
    { value: "7", label: mesesConstants[6] },
    { value: "8", label: mesesConstants[7] },
    { value: "9", label: mesesConstants[8] },
    { value: "10", label: mesesConstants[9] },
    { value: "11", label: mesesConstants[10] },
    { value: "12", label: mesesConstants[11] },
];

export interface CobrancaFormContentProps {
    form: UseFormReturn<CobrancaFormData>;
    mode: "create" | "edit";
    cobranca?: Cobranca;
    diaVencimento?: number;
    hideButtons?: boolean;
    onCancel?: () => void;
    isSubmitting?: boolean;
    lockFoiPago?: boolean;
    lockMesAno?: boolean;
    availableMonths?: number[];
}

export function CobrancaFormContent({
    form,
    mode,
    cobranca,
    diaVencimento,
    hideButtons = false,
    onCancel,
    isSubmitting = false,
    lockFoiPago = false,
    lockMesAno = false,
    availableMonths,
}: CobrancaFormContentProps) {
    const isPaga = form.watch("foi_pago");
    const mesSelecionado = form.watch("mes");
    const anoSelecionado = form.watch("ano");

    const [openCalendarPagamento, setOpenCalendarPagamento] = useState(false);
    const [openCalendarVencimento, setOpenCalendarVencimento] = useState(false);
    const paymentDetailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isPaga && !lockFoiPago) {
            setTimeout(() => {
                paymentDetailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [isPaga, lockFoiPago]);

    // --- Logic for Create Mode (Mes/Ano Sync) ---
    const currentYear = getNowBR().getFullYear();

    const isFutureMonth = (mes?: string | number, ano?: string | number) => {
        if (!mes || !ano) return false;
        const mesNum = typeof mes === "number" ? mes : parseInt(mes, 10);
        const anoNum = typeof ano === "number" ? ano : parseInt(ano, 10);
        if (isNaN(mesNum) || isNaN(anoNum)) return false;
        const dataSelecionada = anoNum * 100 + mesNum;
        const dataAtual = currentYear * 100 + (getNowBR().getMonth() + 1);
        return dataSelecionada > dataAtual;
    };

    const isMesFuturo = isFutureMonth(mesSelecionado, anoSelecionado);

    // Sync Data Vencimento when Mes/Ano changes in Create Mode
    useEffect(() => {
        if (mode === "create" && mesSelecionado && anoSelecionado) {
            const mesNum = typeof mesSelecionado === "number" ? mesSelecionado : parseInt(mesSelecionado, 10);
            const anoNum = typeof anoSelecionado === "number" ? anoSelecionado : parseInt(anoSelecionado, 10);

            const novaData = calculateSafeDueDate(
                diaVencimento,
                mesNum - 1,
                anoNum
            );

            form.setValue("data_vencimento", novaData, { shouldValidate: true });

            // Validação de pagamentos futuros
            const isFuture = isFutureMonth(mesSelecionado, anoSelecionado);
            form.setValue("is_future", isFuture);
            if (!isFuture) {
                form.clearErrors("foi_pago");
            }
        }
    }, [mode, mesSelecionado, anoSelecionado, diaVencimento, form]);

    // --- Logic for Edit Mode ---
    const isPagamentoManual = cobranca?.pagamento_manual;

    // Condições de bloqueio
    const shouldDisableValue = mode === "edit" && (isPaga && !isPagamentoManual);
    const shouldDisableDueDate = mode === "edit" && isPaga;
    // Disable calendar date logic for Edit Vencimento
    const cobrancaMesAnoDate = cobranca ? parseLocalDate(cobranca.data_vencimento) : getNowBR();

    return (
        <div className="space-y-4">
            {/* --- Create Mode: Mes/Ano Selectors --- */}
            {mode === "create" && (
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="mes"
                        render={({ field, fieldState }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                    Mês <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                    <NativeSelect
                                        value={field.value != null ? String(field.value) : ""}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        disabled={lockMesAno}
                                        error={!!fieldState.error}
                                    >
                                        <option value="" disabled hidden>Mês</option>
                                        {(() => {
                                            const options = availableMonths && availableMonths.length > 0
                                                ? meses.filter((m) => availableMonths.includes(Number(m.value)))
                                                : meses;
                                            return options.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ));
                                        })()}
                                    </NativeSelect>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ano"
                        render={({ field, fieldState }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                    Ano <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                    <NativeSelect
                                        value={field.value != null ? String(field.value) : ""}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        disabled
                                        error={!!fieldState.error}
                                        className="opacity-80"
                                    >
                                        <option value="" disabled hidden>Ano</option>
                                        {anos.filter(a => a.value === String(getNowBR().getFullYear())).map((a) => (
                                            <option key={a.value} value={a.value}>
                                                {a.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {/* --- Aviso de Mês Futuro --- */}
            {mode === "create" && isMesFuturo && (
                <Banner
                    variant="warning"
                    title="ATENÇÃO: Mês futuro"
                    description="Só registre agora caso seja um adiantamento."
                />
            )}

            {/* --- Valor --- */}
            <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                    <MoneyInput
                        field={field}
                        required
                        disabled={shouldDisableValue}
                        labelClassName="text-[#0a0a0a] font-medium text-xs"
                        inputClassName="pl-12 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] focus:bg-white focus:border-[#0a0a0a] transition-all"
                        label={lockFoiPago ? "Valor Pago" : "Valor da Parcela"}
                    />
                )}
            />

            {/* --- Edit Mode: Vencimento DatePicker --- */}
            {mode === "edit" && (
                <FormField
                    control={form.control}
                    name="data_vencimento"
                    render={({ field, fieldState }) => (
                        <FormItem className="flex flex-col space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                Data do Vencimento <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <Popover
                                open={openCalendarVencimento}
                                onOpenChange={(open) => {
                                    if (!shouldDisableDueDate) setOpenCalendarVencimento(open);
                                }}
                            >
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={shouldDisableDueDate}
                                                className={cn(
                                                    "w-full pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-white text-sm text-[#0a0a0a] justify-start shadow-none",
                                                    !field.value && "text-[#737373]",
                                                    fieldState.error && "border-[#e7000b]"
                                                )}
                                            >
                                                {field.value ? formatLocalDate(field.value) : "Selecione"}
                                            </Button>
                                        </div>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            if (date) {
                                                field.onChange(date);
                                                setOpenCalendarVencimento(false);
                                            }
                                        }}
                                        defaultMonth={cobrancaMesAnoDate}
                                        fromMonth={startOfMonth(cobrancaMesAnoDate)}
                                        toMonth={endOfMonth(cobrancaMesAnoDate)}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {mode === "create" && !lockFoiPago && (
                <FormField
                    control={form.control}
                    name="foi_pago"
                    render={({ field }) => (
                        <FormItem
                            className="flex flex-row items-center justify-between rounded-[20px] bg-[#fafafa] border border-[#e5e5e5] p-4 transition-all hover:bg-[#f5f5f5] cursor-pointer shadow-xs select-none gap-4"
                            onClick={() => !lockFoiPago && field.onChange(!field.value)}
                        >
                            <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                                <FormLabel className="text-sm font-semibold text-[#0a0a0a] block cursor-pointer">
                                    Esta parcela já foi paga?
                                </FormLabel>
                                <p className="text-xs text-[#737373] leading-relaxed">
                                    {field.value
                                        ? "A parcela será registrada como paga com baixa imediata."
                                        : "A parcela permanecerá pendente de pagamento."}
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={lockFoiPago}
                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#e5e5e5] shrink-0"
                                    aria-label="Esta parcela já foi paga?"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            )}

            {/* --- Detalhes do Pagamento (Se pago) --- */}
            {isPaga && (
                <div
                    ref={paymentDetailsRef}
                    className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <FormField
                        control={form.control}
                        name="data_pagamento"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col space-y-1.5">
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                    Data do pagamento <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <Popover open={openCalendarPagamento} onOpenChange={setOpenCalendarPagamento}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left text-sm text-[#0a0a0a] hover:bg-white justify-start shadow-none",
                                                        !field.value && "text-[#737373]",
                                                        fieldState.error && "border-[#e7000b]"
                                                    )}
                                                >
                                                    {field.value ? formatLocalDate(field.value) : "Selecione a data"}
                                                </Button>
                                            </div>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setOpenCalendarPagamento(false);
                                            }}
                                            disabled={(date) => {
                                                const now = new Date();
                                                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                                return d > today;
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
                        name="tipo_pagamento"
                        render={({ field, fieldState }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                    Forma de pagamento <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                    <NativeSelect
                                        icon={<CreditCard className="h-4 w-4" />}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        error={!!fieldState.error}
                                    >
                                        <option value="" disabled hidden>Selecionar</option>
                                        {tiposPagamento.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="enviar_recibo_whatsapp_manual"
                        render={({ field }) => (
                            <FormItem
                                className="flex flex-row items-center justify-between rounded-[20px] bg-white border border-[#e5e5e5] p-4 transition-all hover:bg-[#fafafa] cursor-pointer shadow-xs select-none gap-4"
                                onClick={() => field.onChange(!field.value)}
                            >
                                <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                                    <FormLabel className="text-sm font-semibold text-[#0a0a0a] block cursor-pointer">
                                        Enviar Recibo no WhatsApp
                                    </FormLabel>
                                    <p className="text-xs text-[#737373] leading-relaxed">
                                        {field.value
                                            ? "O comprovante de pagamento será enviado automaticamente para o WhatsApp do responsável."
                                            : "O pagamento será salvo sem enviar comprovante por WhatsApp."}
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#e5e5e5] shrink-0"
                                        aria-label="Enviar Recibo no WhatsApp"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                    <FormItem className="space-y-1.5">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Observação <span className="text-[11px] text-[#737373] font-normal">(apenas para você)</span>
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Anotações internas sobre esta parcela..."
                                className="min-h-[80px] rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] resize-none text-sm text-[#0a0a0a] focus:bg-white focus:border-[#0a0a0a] transition-all"
                                {...field}
                                value={field.value || ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {!hideButtons && (
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-10 sm:h-11 rounded-[18px] bg-primary hover:bg-primary/90 text-white font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                            </>
                        ) : mode === "create" ? "Registrar Parcela" : "Salvar Alterações"}
                    </Button>
                </div>
            )}
        </div>
    );
}

interface CobrancaFormProps {
    mode: "create" | "edit";
    cobranca?: Cobranca;
    passageiroId?: string;
    diaVencimento?: number; // Dia padrão de vencimento para Create
    valor?: number; // Valor padrão
    onSuccess: () => void;
    onCancel: () => void;
}

export function CobrancaForm({
    mode,
    cobranca,
    passageiroId,
    diaVencimento = 10,
    valor,
    onSuccess,
    onCancel,
}: CobrancaFormProps) {
    const { form, onSubmit, isSubmitting } =
        useCobrancaForm({
            mode,
            cobranca,
            passageiroId,
            diaVencimento,
            valor,
            onSuccess,
        });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit}>
                <CobrancaFormContent
                    form={form}
                    mode={mode}
                    cobranca={cobranca}
                    diaVencimento={diaVencimento}
                    hideButtons={false}
                    onCancel={onCancel}
                    isSubmitting={isSubmitting}
                />
            </form>
        </Form>
    );
}
