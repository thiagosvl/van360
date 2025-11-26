import { MoneyInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Contact,
  Loader2,
  User,
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
        className="max-w-md max-h-[95vh] overflow-y-auto bg-white"
      >
        <DialogHeader>
          <DialogTitle>Registrar Cobrança</DialogTitle>
        </DialogHeader>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Passageiro</span>
          </div>
          <p className="font-semibold">{passageiroNome}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Contact className="w-4 h-4" />
            <span>Responsável</span>
          </div>
          <p className="font-semibold">{passageiroResponsavelNome}</p>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
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
                        <SelectTrigger>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
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
                        <SelectTrigger>
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
              <div className="flex items-start gap-2 text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
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
                <MoneyInput field={field} required />
              )}
            />
            <FormField
              control={form.control}
              name="foi_pago"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2 pt-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">
                        Já foi pago?
                      </FormLabel>
                    </div>
                  </div>

                  <FormMessage className="mt-1 ml-6 text-xs" />
                </FormItem>
              )}
            />
            {foiPago && (
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="data_pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Data do pagamento{" "}
                        <span className="text-red-600">*</span>
                      </FormLabel>
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                                form.formState.errors.data_pagamento &&
                                  "border-red-500 ring-red-500"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span className="text-black">
                                  Selecione a data
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Forma de pagamento{" "}
                        <span className="text-red-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma" />
                          </SelectTrigger>
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
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || form.formState.isSubmitting}
                className="flex-1"
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
      </DialogContent>
    </Dialog>
  );
}
