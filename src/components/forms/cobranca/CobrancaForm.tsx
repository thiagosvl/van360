import { MoneyInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CobrancaFormData, useCobrancaForm } from "@/hooks/form/useCobrancaForm";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import {
    anos,
    tiposPagamento,
} from "@/utils/formatters";
import { endOfMonth, format, startOfMonth } from "date-fns";
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
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export interface CobrancaFormContentProps {
    form: UseFormReturn<CobrancaFormData>;
    mode: "create" | "edit";
    cobranca?: Cobranca;
    diaVencimento?: number;
    hideButtons?: boolean;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

export function CobrancaFormContent({
    form,
    mode,
    cobranca,
    diaVencimento = 10,
    hideButtons = false,
    onCancel,
    isSubmitting = false,
}: CobrancaFormContentProps) {
    const isPaga = form.watch("foi_pago");
    const mesSelecionado = form.watch("mes");
    const anoSelecionado = form.watch("ano");

    const [openCalendarPagamento, setOpenCalendarPagamento] = useState(false);
    const [openCalendarVencimento, setOpenCalendarVencimento] = useState(false);
    const paymentDetailsRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to payment details when 'isPaga' is checked
    useEffect(() => {
        if (isPaga) {
            setTimeout(() => {
                paymentDetailsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [isPaga]);

    // --- Logic for Create Mode (Mes/Ano Sync) ---
    const currentYear = new Date().getFullYear();

    const isFutureMonth = (mes?: string, ano?: string) => {
        if (!mes || !ano) return false;
        const mesNum = parseInt(mes);
        const anoNum = parseInt(ano);
        const dataSelecionada = anoNum * 100 + mesNum;
        const dataAtual = currentYear * 100 + (new Date().getMonth() + 1);
        return dataSelecionada > dataAtual;
    };

    const isMesFuturo = isFutureMonth(mesSelecionado, anoSelecionado);

    // Sync Data Vencimento when Mes/Ano changes in Create Mode
    useEffect(() => {
        if (mode === "create" && mesSelecionado && anoSelecionado) {
            const novaData = new Date(
                parseInt(anoSelecionado),
                parseInt(mesSelecionado) - 1,
                diaVencimento
            );
            
            // Ajuste simples para manter mês
            if (novaData.getMonth() !== parseInt(mesSelecionado) - 1) {
                novaData.setDate(0); 
            }
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
    const cobrancaMesAnoDate = cobranca ? new Date(cobranca.data_vencimento) : new Date();

    return (
        <div className="space-y-4">
            {/* --- Create Mode: Mes/Ano Selectors --- */}
            {mode === "create" && (
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="mes"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                    Mês <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger
                                            className={cn(
                                                "h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 transition-all",
                                                fieldState.error && "border-red-500"
                                            )}
                                        >
                                            <SelectValue placeholder="Mês" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60">
                                        {meses.map((m) => (
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
                        name="ano"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                    Ano <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger
                                            className={cn(
                                                "h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 transition-all",
                                                fieldState.error && "border-red-500"
                                            )}
                                        >
                                            <SelectValue placeholder="Ano" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60">
                                        {anos.map((a) => (
                                            <SelectItem key={a.value} value={a.value}>
                                                {a.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {/* --- Aviso de Mês Futuro --- */}
            {mode === "create" && isMesFuturo && (
                <div className="flex items-start gap-2 text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600" />
                    <p className="font-medium leading-snug">
                        <span className="font-bold">Aviso: Mês Futuro.</span>{" "}
                        Registre agora apenas se for um adiantamento.
                    </p>
                </div>
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
                        inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 transition-all"
                        label="Valor da Cobrança"
                    />
                )}
            />

            {/* --- Edit Mode: Vencimento DatePicker --- */}
            {mode === "edit" && (
                <FormField
                    control={form.control}
                    name="data_vencimento"
                    render={({ field, fieldState }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-700 font-medium ml-1">
                                Data do Vencimento <span className="text-red-600">*</span>
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
                                            <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={shouldDisableDueDate}
                                                className={cn(
                                                    "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left font-normal hover:bg-gray-100 justify-start",
                                                    !field.value && "text-muted-foreground",
                                                    fieldState.error && "border-red-500"
                                                )}
                                            >
                                                {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione"}
                                            </Button>
                                        </div>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
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

            <FormField
                control={form.control}
                name="foi_pago"
                render={({ field }) => (
                    <FormItem className={cn(
                        "flex flex-col p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0",
                        mode === "edit" && "hidden"
                    )}>
                        <div className="flex items-center gap-3">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </FormControl>
                            <div className="flex-1 space-y-1 leading-none">
                                <FormLabel className="cursor-pointer font-medium text-gray-700 m-0 mt-0 w-full block">
                                    Esta cobrança já foi paga?
                                </FormLabel>
                            </div>
                        </div>
                        <FormMessage className="pt-2" />
                    </FormItem>
                )}
            />

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
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                    Data do pagamento <span className="text-red-600">*</span>
                                </FormLabel>
                                <Popover open={openCalendarPagamento} onOpenChange={setOpenCalendarPagamento}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left font-normal hover:bg-gray-100 justify-start",
                                                        !field.value && "text-muted-foreground",
                                                        fieldState.error && "border-red-500"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione"}
                                                </Button>
                                            </div>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setOpenCalendarPagamento(false);
                                            }}
                                            disabled={(date) => date > new Date()}
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
                            <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                    Forma de pagamento <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                            <SelectTrigger
                                                className={cn(
                                                    "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 transition-all",
                                                    fieldState.error && "border-red-500"
                                                )}
                                            >
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </div>
                                    </FormControl>
                                    <SelectContent>
                                        {tiposPagamento.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {!hideButtons && (
                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 font-medium"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                            </>
                        ) : mode === "create" ? "Criar Cobrança" : "Salvar Alterações"}
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
