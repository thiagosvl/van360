import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
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
  })
  .refine(
    (data) => {
      if (data.foi_pago && !data.data_pagamento) {
        return false;
      }
      return true;
    },
    {
      message: "Campo obrigatório",
      path: ["data_pagamento"],
    }
  )
  .refine(
    (data) => {
      if (data.foi_pago && !data.tipo_pagamento) {
        return false;
      }
      return true;
    },
    {
      message: "Campo obrigatório",
      path: ["tipo_pagamento"],
    }
  );

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
  const [loading, setLoading] = useState(false);
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
      valor: moneyMask((valorMensalidade * 100).toString()),
      foi_pago: false,
      data_pagamento: undefined,
      tipo_pagamento: "",
    },
  });

  const foiPago = form.watch("foi_pago");

  const handleSubmit = async (data: CobrancaRetroativaFormData) => {
    setLoading(true);
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
          title: "Já existe uma cobrança registrada para esse mês.",
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
        data_vencimento: dataVencimento.toISOString().split("T")[0],
        status: data.foi_pago ? "pago" : "pendente",
        data_pagamento:
          data.foi_pago && data.data_pagamento
            ? data.data_pagamento.toISOString().split("T")[0]
            : null,
        tipo_pagamento: data.foi_pago ? data.tipo_pagamento : null,
        pagamento_manual: data.foi_pago,
        usuario_id: localStorage.getItem("app_user_id"),
        origem: "manual"
      };

      const { error } = await (supabase as any)
        .from("cobrancas")
        .insert([cobrancaData]);

      if (error) throw error;

      toast({
        title: "Cobrança retroativa registrada com sucesso.",
      });

      onCobrancaAdded();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Erro ao registrar cobrança retroativa:", error);
      toast({
        title: "Erro ao registrar cobrança retroativa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Cobrança Retroativa</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {passageiroNome} (Responsável {passageiroResponsavelNome})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <FormLabel>Mês</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o mês" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel>Ano</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            const maskedValue = moneyMask(e.target.value);
                            field.onChange(maskedValue);
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Foi pago?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {foiPago && (
                  <>
                    <FormField
                      control={form.control}
                      name="data_pagamento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de pagamento *</FormLabel>
                          <Popover
                            open={openCalendar}
                            onOpenChange={setOpenCalendar}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenCalendar(true)}
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
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpenCalendar(false);
                                }}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
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
                            <SelectContent>
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
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
