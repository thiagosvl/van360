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
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toLocalDateString } from "@/utils/formatters";
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

const cobrancaRetroativaSchema = z
  .object({
    mes: z.string().min(1, "Campo obrigatório"),
    ano: z.string().min(1, "Campo obrigatório"),
    valor: z.string().min(1, "Campo obrigatório"),
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

type CobrancaRetroativaFormData = z.infer<typeof cobrancaRetroativaSchema>;

interface CobrancaRetroativaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  passageiroNome: string;
  passageiroResponsavelNome: string;
  valorMensalidade: number;
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

const tiposPagamento = [
  { value: "PIX", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao-debito", label: "Cartão de Débito" },
  { value: "cartao-credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export default function CobrancaRetroativaDialog({
  isOpen,
  onClose,
  passageiroId,
  passageiroNome,
  passageiroResponsavelNome,
  valorMensalidade,
  diaVencimento,
  onCobrancaAdded,
}: CobrancaRetroativaDialogProps) {
  const { toast } = useToast();
  const [openCalendar, setOpenCalendar] = useState(false);

  const currentYear = new Date().getFullYear();
  const anos = [
    { value: currentYear.toString(), label: currentYear.toString() },
    {
      value: (currentYear - 1).toString(),
      label: (currentYear - 1).toString(),
    },
  ];

  const form = useForm<CobrancaRetroativaFormData>({
    resolver: zodResolver(cobrancaRetroativaSchema),
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
      form.reset({
        mes: "",
        ano: currentYear.toString(),
        valor:
          valorMensalidade > 0
            ? moneyMask((valorMensalidade * 100).toString())
            : "",
        foi_pago: false,
        data_pagamento: undefined,
        tipo_pagamento: "",
        is_future: false,
      });
    }
  }, [isOpen, valorMensalidade, form, currentYear]);

  const handleSubmit = async (data: CobrancaRetroativaFormData) => {
    try {
      const { data: existingCobranca, error: checkError } = await supabase
        .from("cobrancas")
        .select("id")
        .eq("passageiro_id", passageiroId)
        .eq("mes", parseInt(data.mes))
        .eq("ano", parseInt(data.ano))
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      if (existingCobranca) {
        toast({
          title:
            "O passageiro já possui uma mensalidade desse mês e ano indicado",
          variant: "destructive",
        });
        return;
      }
      const dataVencimento = new Date(
        parseInt(data.ano),
        parseInt(data.mes) - 1,
        diaVencimento
      );
      const cobrancaData = {
        passageiro_id: passageiroId,
        mes: parseInt(data.mes),
        ano: parseInt(data.ano),
        valor: moneyToNumber(data.valor),
        data_vencimento: toLocalDateString(dataVencimento),
        status: data.foi_pago ? "pago" : "pendente",
        data_pagamento:
          data.foi_pago && data.data_pagamento
            ? toLocalDateString(data.data_pagamento)
            : null,
        tipo_pagamento: data.foi_pago ? data.tipo_pagamento : null,
        pagamento_manual: data.foi_pago,
        usuario_id: localStorage.getItem("app_user_id"),
        origem: "manual",
      };
      const { error } = await supabase.from("cobrancas").insert([cobrancaData]);
      if (error) throw error;
      toast({ title: "Mensalidade registrada com sucesso." });
      onCobrancaAdded();
      handleClose();
    } catch (error) {
      console.error("Erro ao registrar mensalidade:", error);
      toast({
        title: "Erro ao registrar mensalidade.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-md max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Registrar Mensalidade</DialogTitle>
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
                    <FormLabel>Mês *</FormLabel>
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
                    <FormLabel>Ano *</FormLabel>
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
                <p className="font-medium leading-snug">
                  <span className="font-bold">Aviso: Mês Futuro.</span> Esta
                  mensalidade será gerada automaticamente no início do mês
                  selecionado. Registre agora apenas se for um adiantamento.
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(moneyMask(e.target.value));
                      }}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
                      <FormLabel>Data do pagamento *</FormLabel>
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
                                <span className="text-black">Selecione a data</span>
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
                      <FormLabel>Forma de pagamento *</FormLabel>
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
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? (
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
