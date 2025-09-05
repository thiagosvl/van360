import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "./ui/card";

interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  passageiroNome: string;
  valorOriginal: number;
  onPaymentRecorded: () => void;
}

const paymentSchema = z.object({
  valor_pago: z.string().min(1, "Campo obrigatório"),
  data_pagamento: z.string().min(1, "Campo obrigatório"),
  tipo_pagamento: z.string().min(1, "Campo obrigatório"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function ManualPaymentDialog({
  isOpen,
  onClose,
  cobrancaId,
  passageiroNome,
  valorOriginal,
  onPaymentRecorded,
}: ManualPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      valor_pago: "",
      data_pagamento: new Date().toISOString().split("T")[0],
      tipo_pagamento: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        valor_pago: valorOriginal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        data_pagamento: new Date().toISOString().split("T")[0],
        tipo_pagamento: "",
      });
    }
  }, [isOpen, valorOriginal, form]);

  const handleSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    try {
      const valorNumerico = moneyToNumber(data.valor_pago);

      const { error } = await supabase
        .from("cobrancas")
        .update({
          status: "pago",
          data_pagamento: data.data_pagamento,
          tipo_pagamento: data.tipo_pagamento,
          valor: valorNumerico,
          pagamento_manual: true,
        })
        .eq("id", cobrancaId);

      if (error) throw error;

      toast({
        title: `Pagamento de ${passageiroNome} registrado com sucesso.`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro ao registrar pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset({
      valor_pago: valorOriginal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      data_pagamento: new Date().toISOString().split("T")[0],
      tipo_pagamento: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Registrar Pagamento Manual</DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium">Passageiro</Label>
                  <Input value={passageiroNome} disabled className="mt-1" />
                </div>

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
                            const maskedValue = moneyMask(e.target.value);
                            field.onChange(maskedValue);
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
                    <FormItem>
                      <FormLabel>Data do Pagamento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 mt-8 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Registrando..." : "Registrar Pagamento"}
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
