import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";
import { cobrancaService } from "@/services/cobrancaService";
import { toLocalDateString } from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Contact, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  passageiroNome: string;
  responsavelNome: string;
  valorOriginal: number;
  onPaymentRecorded: () => void;
}

const paymentSchema = z.object({
  valor_pago: z.string().min(1, "Campo obrigatório"),
  data_pagamento: z.date({
    required_error: "A data de pagamento é obrigatória.",
  }),
  tipo_pagamento: z.string().min(1, "A forma de pagamento é obrigatória."),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function ManualPaymentDialog({
  isOpen,
  onClose,
  cobrancaId,
  passageiroNome,
  responsavelNome,
  valorOriginal,
  onPaymentRecorded,
}: ManualPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      valor_pago: "",
      data_pagamento: new Date(),
      tipo_pagamento: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        valor_pago: moneyMask((valorOriginal * 100).toString()),
        data_pagamento: new Date(),
        tipo_pagamento: "",
      });
    }
  }, [isOpen, valorOriginal, form]);

  const handleSubmit = async (data: PaymentFormData) => {
    setLoading(true);

    try {
      const pagamentoData = {
        valor_pago: moneyToNumber(data.valor_pago),
        data_pagamento: toLocalDateString(data.data_pagamento),
        tipo_pagamento: data.tipo_pagamento,
      };

      await cobrancaService.registrarPagamentoManual(cobrancaId, pagamentoData);

      toast({
        title: `Pagamento registrado com sucesso.`,
      });
      onPaymentRecorded();
      onClose();
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro ao registrar pagamento.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-md max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
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
          <p className="font-semibold">{responsavelNome}</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="valor_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Pago *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="R$ 0,00"
                      onChange={(e) => {
                        field.onChange(moneyMask(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Pagamento *</FormLabel>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
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

                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            setOpenCalendar(false);
                          }
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="cartao-credito">
                        Cartão de Crédito
                      </SelectItem>
                      <SelectItem value="cartao-debito">
                        Cartão de Débito
                      </SelectItem>
                      <SelectItem value="transferencia">
                        Transferência
                      </SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Registrando...
                  </>
                ) : (
                  "Registrar Pagamento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
