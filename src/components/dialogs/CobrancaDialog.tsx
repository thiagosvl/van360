import { MoneyInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog";
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
import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { useCreateCobranca } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import {
  anos,
  parseCurrencyToNumber,
  tiposPagamento,
  toLocalDateString,
} from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarIcon,
  CreditCard,
  Loader2,
  PlusCircle,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const cobrancaSchema = z
  .object({
    mes: z.string().min(1, "Campo obrigatório"),
    ano: z.string().min(1, "Campo obrigatório"),
    valor: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => parseCurrencyToNumber(val) > 0, {
        message: "O valor deve ser maior que 0",
      }),
    foi_pago: z.boolean().default(false),
    data_pagamento: z.date().optional(),
    tipo_pagamento: z.string().optional(),
    is_future: z.boolean().default(false),
  })
  .refine((data) => !data.foi_pago || (data.foi_pago && data.data_pagamento), {
    message: "Campo obrigatório",
    path: ["data_pagamento"],
  })
  .refine((data) => !data.foi_pago || (data.foi_pago && data.tipo_pagamento), {
    message: "Campo obrigatório",
    path: ["tipo_pagamento"],
  })
  .refine((data) => !data.is_future || data.foi_pago, {
    message:
      "Para meses futuros, é obrigatório registrar o pagamento antecipado.",
    path: ["foi_pago"],
  });

type CobrancaFormData = z.infer<typeof cobrancaSchema>;

interface CobrancaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  passageiroNome: string;
  passageiroResponsavelNome: string;
  valorCobranca: number;
  diaVencimento: number;
  onCobrancaAdded: () => void;
}

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

export default function CobrancaDialog({
  isOpen,
  onClose,
  passageiroId,
  passageiroNome,
  passageiroResponsavelNome,
  valorCobranca,
  diaVencimento,
  onCobrancaAdded,
}: CobrancaDialogProps) {
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const [openCalendar, setOpenCalendar] = useState(false);
  const registerOnAsaas = false;

  const createCobranca = useCreateCobranca();
  const loading = createCobranca.isPending;

  const currentYear = new Date().getFullYear();

  const form = useForm<CobrancaFormData>({
    resolver: zodResolver(cobrancaSchema),
    defaultValues: {
      mes: "",
      ano: currentYear.toString(),
      valor: "",
      foi_pago: false,
      data_pagamento: undefined,
      tipo_pagamento: "",
    },
    mode: "onBlur",
    shouldUnregister: false,
  });

  const foiPago = form.watch("foi_pago");

  const mesSelecionado = form.watch("mes");
  const anoSelecionado = form.watch("ano");

  const isFutureMonth = (mes: string, ano: string) => {
    if (!mes || !ano) return false;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    const dataSelecionada = anoNum * 100 + mesNum;
    const dataAtual = currentYear * 100 + (new Date().getMonth() + 1);

    return dataSelecionada > dataAtual;
  };

  const isMesFuturo = isFutureMonth(mesSelecionado, anoSelecionado);

  useEffect(() => {
    if (isOpen) {
      const valorEmCentavos = valorCobranca > 0 ? Math.round(Number(valorCobranca) * 100) : 0;
      form.reset({
        mes: "",
        ano: currentYear.toString(),
        valor: valorEmCentavos > 0 ? moneyMask(String(valorEmCentavos)) : "",
        foi_pago: false,
        data_pagamento: undefined,
        tipo_pagamento: "",
        is_future: false,
      });
    }
  }, [isOpen, valorCobranca, form, currentYear]);

  const handleSubmit = async (data: CobrancaFormData) => {
    if (!profile?.id) return;

    // Verificar se já existe cobrança (validação no backend também)

    const dataVencimento = new Date(
      parseInt(data.ano),
      parseInt(data.mes) - 1,
      diaVencimento
    );

    const valorNumerico = moneyToNumber(data.valor);
    const cobrancaData = {
      passageiro_id: passageiroId,
      mes: data.mes,
      ano: data.ano,
      valor: valorNumerico,
      data_vencimento: toLocalDateString(dataVencimento),
      status: data.foi_pago ? PASSAGEIRO_COBRANCA_STATUS_PAGO : "pendente",
      data_pagamento:
        data.foi_pago && data.data_pagamento
          ? toLocalDateString(data.data_pagamento)
          : null,
      tipo_pagamento: data.foi_pago ? data.tipo_pagamento : null,
      pagamento_manual: data.foi_pago,
      usuario_id: profile.id,
      origem: "manual",
    };

    createCobranca.mutate(cobrancaData, {
      onSuccess: () => {
        onCobrancaAdded();
        handleClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-md max-h-[95vh] overflow-y-auto bg-blue-600 rounded-3xl border-0 shadow-2xl p-0"
        hideCloseButton
      >
        <div className="bg-blue-600 p-6 text-center relative">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Registrar Cobrança
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-sm mt-1">
            Preencha os dados da nova cobrança
          </DialogDescription>
        </div>

        <div className="p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{passageiroNome}</p>
              <p className="text-xs text-gray-500">{passageiroResponsavelNome}</p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mes"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium ml-1">
                        Mês <span className="text-red-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const isFuture = isFutureMonth(value, anoSelecionado);

                          form.setValue("is_future", isFuture, {
                            shouldValidate: true,
                          });

                          if (!isFuture) {
                            form.clearErrors("foi_pago");
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger 
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {meses.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value}>
                              {mes.label}
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
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const isFuture = isFutureMonth(mesSelecionado, value);

                          form.setValue("is_future", isFuture, {
                            shouldValidate: true,
                          });

                          if (!isFuture) {
                            form.clearErrors("foi_pago");
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger 
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {anos.map((ano) => (
                            <SelectItem key={ano.value} value={ano.value}>
                              {ano.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isMesFuturo && (
                <div className="flex items-start gap-2 text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600" />
                  {!registerOnAsaas ? (
                    <p className="font-medium leading-snug">
                      <span className="font-bold">Aviso: Mês Futuro.</span>{" "}
                      Registre agora apenas se for um adiantamento.
                    </p>
                  ) : (
                    <p className="font-medium leading-snug">
                      <span className="font-bold">Aviso: Mês Futuro.</span> Esta
                      cobrança será gerada automaticamente no início do mês
                      selecionado. Registre agora apenas se for um adiantamento.
                    </p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    required
                    inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    label="Valor da Cobrança"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="foi_pago"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex-1 cursor-pointer font-medium text-gray-700 m-0 mt-0">
                        Esta cobrança já foi paga?
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              {foiPago && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormField
                    control={form.control}
                    name="data_pagamento"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Data do pagamento{" "}
                          <span className="text-red-600">*</span>
                        </FormLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <div className="relative">
                                <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left font-normal hover:bg-gray-100 justify-start",
                                    !field.value && "text-muted-foreground",
                                    form.formState.errors.data_pagamento &&
                                      "border-red-500 ring-red-500"
                                  )}
                                  aria-invalid={!!fieldState.error}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span className="text-gray-500">
                                      Selecione a data
                                    </span>
                                  )}
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
                                setOpenCalendar(false);
                              }}
                              disabled={(date) => date > new Date()}
                              initialFocus
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
                          Forma de pagamento{" "}
                          <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <div className="relative">
                              <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <SelectTrigger 
                                className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Selecione a forma" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {tiposPagamento.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
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
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || form.formState.isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  {loading || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
